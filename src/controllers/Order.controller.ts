/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
import i18next from 'i18next';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { body, validationResult } from 'express-validator';
import cron from 'node-cron';
import {
  Transactional,
  runOnTransactionCommit,
  runOnTransactionRollback,
} from 'typeorm-transactional';
import { AppDataSource } from '../config/database';
import {
  PAGE_SIZE,
  calculateOffset,
  DEFAULT_PAGE,
  formatDate,
  getStatusText,
  OrderStatus,
} from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { upload, transporter } from '../index';
import { Order } from '../entities/Order';
import { OrderDetail } from '../entities/OrderDetail';
import { Cart } from '../entities/Cart';
import { Product } from '../entities/Product';
import { CartItem } from '../entities/CartItem';
import { checkLoggedIn } from '../utils/auth';
import { User } from '../entities/User';

const orderRepository = AppDataSource.getRepository(Order);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

const getUserCart = async (userId: number, res: Response) => {
  const cart = await cartRepository.findOne({
    where: { user: { id: userId } },
  });
  if (!cart) {
    res.redirect('/');
    return;
  }
  return cart;
};
// GET list item in cart
export const getListItemOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const newUser = await userRepository.findOne({
      where: {id :+ user.id}
    })
    const cart = await getUserCart(user.id, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [cartItems, totalItems] = await cartItemRepository.findAndCount({
      where: { cart: { id: cart.id } },
      relations: ['product'],
      take: PAGE_SIZE,
      skip: offset,
    });
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    // Get total price
    const rawResult = await cartItemRepository
      .createQueryBuilder('cartItem')
      .select('count(cartItem.id) as items')
      .addSelect('sum(cartItem.quantity * product.price) as total')
      .leftJoin('cartItem.product', 'product')
      .where('cartItem.cartId = :cartId', { cartId: cart.id })
      .getRawOne();

    const { total, items } = rawResult;

    res.render('checkout', {
      newUser,
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
      total,
      items,
      cartItems,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

class ProcessOrder {
  // Hàm để xử lý đơn hàng
  @Transactional()
  static async processOrder(req: Request, res: Response, imagePath: string) {
    const user = await checkLoggedIn(req, res);
    const { name, phone, address, typeOrder, totalAmount } = req.body;
    const order = await createOrder(
      { name, phone, address, typeOrder, totalAmount },
      imagePath,
      user,
    );
    await orderRepository.save(order);

    const cart = await getUserCart(user.id, res);
    const cartItems = await getCartItems(cart);
      
    // tao chi tiet don hang
    await createOrderDetails(order, cartItems);
    //  cap nhat so luong san pham
    await updateProductQuantities(cartItems);
    await deleteCartItems(cart);

    runOnTransactionRollback(() => console.log('rollbacked'));
    runOnTransactionCommit(() => console.log('committed'));

    res.redirect('/order/success');
  }
}

// Hàm để tạo đơn hàng
const createOrder = async (options = {}, image: string, user: User) => {
  const order: Order = orderRepository.create({
    ...options,
    status: 1,
    image,
    user,
    dateOrder: new Date(),
  });
  return order;
};

// Hàm để lấy danh sách mục giỏ hàng
const getCartItems = async (cart: Cart) => {
  return await cartItemRepository
    .createQueryBuilder('cartItem')
    .innerJoinAndSelect('cartItem.product', 'product')
    .where('cartItem.cartId = :cartId', { cartId: cart.id })
    .getMany();
};

// Hàm để tạo các chi tiết đơn hàng
const createOrderDetails = async (order: Order, cartItems: CartItem[]) => {
  const orderDetails = cartItems.map((cartItem) => {
    return orderDetailRepository.create({
      ...cartItem,
      price: cartItem.product.price,
      order,
      dateReview: new Date(),
    });
  });

  return await orderDetailRepository.save(orderDetails);
};

// Hàm để cập nhật số lượng sản phẩm
const updateProductQuantities = async (cartItems: CartItem[]) => {
  const products = cartItems.map((cartItem) => {
    const count = cartItem.product.quantity - cartItem.quantity;
    const product = new Product();
    product.id = cartItem.product.id;
    product.quantity = count;
    product.numberSold = cartItem.quantity;
    return product;
  });
  return await Promise.all(
    products.map((product) => {
      return productRepository.update(
        { id: product.id },
        { quantity: product.quantity, numberSold: product.numberSold },
      );
    }),
  );
};

// Hàm để xóa các mục trong giỏ hàng
const deleteCartItems = async (cart: Cart) => {
  return await cartItemRepository.delete({ cart: { id: cart.id } });
};

// Sử dụng Validation middleware
export const validateOrder = [
  body('name')
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage(() => i18next.t('order.nameLength')),

  body('phone')
    .notEmpty()
    .isLength({ min: 10, max: 11 })
    .withMessage(() => i18next.t('order.phoneLength')),

  body('address')
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage(() => i18next.t('order.addressLength')),
  body('typeOrder')
    .notEmpty()
    .withMessage(i18next.t('order.typeOrderIsRequired')),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('checkout', {
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];

// Handle multipart/form-data trước khi kiểm tra dữ liệu
export const handleUpload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading image.');
    }
    next();
  });
};

// POST order
export const postOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.file && req.file.path) {
      let imagePath = '';
      const uploadDir = path.resolve(__dirname, '../public/upload');
      const relativePath = path.relative(uploadDir, req.file.path);
      imagePath = '/upload/' + relativePath;
      await ProcessOrder.processOrder(req, res, imagePath);
    } else {
      await ProcessOrder.processOrder(req, res, '');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// [GET] status order of user
export const getAllOderListByStatusOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    let isPending = false;

    if (parseInt(req.params.status) == 1) {
      isPending = true;
    }
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [orderLists, total] = await orderRepository.findAndCount({
      relations: ['user'],
      where: {
        user: { id: +user.id },
        status: parseInt(req.params.status),
      },
      take: PAGE_SIZE,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const modifiedOrderLists = orderLists.map((order) => {
      return {
        ...order,
        status: getStatusText(order.status),
        date: formatDate(order.createdAt),
        isPending,
      };
    });

    res.render('order', {
      modifiedOrderLists,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(page, totalPages),
    });
  } catch (err) {
    console.error(err);
    next();
  }
};

// GET view user history order
export const getUserAllOderList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [orderLists, total] = await orderRepository.findAndCount({
      relations: ['user'],
      where: { user: { id: user.id } },
      take: PAGE_SIZE,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const modifiedOrderLists = orderLists.map((order) => {
      return {
        ...order,
        status: getStatusText(order.status),
        date: formatDate(order.createdAt),
      };
    });

    res.render('order', {
      modifiedOrderLists,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(page, totalPages),
    });
    return;
  } catch (err) {
    console.error(err);
    next();
  }
};

// GET admin order detail
export const getOderDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [orderDetail, totalItems] = await orderDetailRepository.findAndCount({
      where: { order: { id: parseInt(req.params.id) } },
      relations: ['product'],
      take: PAGE_SIZE,
      skip: offset,
    });
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    res.render('admin/orderDetail', {
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
      orderDetail,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET user order detail
export const getUserOderDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const offset = calculateOffset(page);
    const [orderDetail, totalItems] = await orderDetailRepository.findAndCount({
      where: { order: { id: parseInt(req.params.id) } },
      relations: ['product', 'order'],
      take: PAGE_SIZE,
      skip: offset,
    });
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const order = orderDetail[0].order;

    res.render('orderDetail', {
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
      orderDetail,
      order
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// send email
const sendEmail = async (status, rejectReason, email, orderDetails) => {
  let mailOptions = {};

  // Set subject and html content based on status
  if (status === 3) {
    mailOptions = {
      subject: 'Thông báo',
      from: `"Shop ecommerce" <${process.env.APP_EMAIL}>`,
      template: 'email_faile',
      to: email,
      context: {
        rejectReason,
        orderDetails,
      },
    };
  } else if (status === 2) {
    mailOptions = {
      subject: 'Thông báo',
      from: `"Shop ecommerce" <${process.env.APP_EMAIL}>`,
      template: 'email_success',
      to: email,
      context: {
        orderDetails,
      },
    };
  } else {
    throw new Error('Invalid status');
  }
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// POST change status [user and admin]
export const postChangeStatusOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = parseInt(req.body.status);
    const rejectReason = req.body.rejectReason;
    const email = req.body.email;

    const updateData: any = { status: status };
    if (parseInt(req.body.status) === OrderStatus.Rejected && rejectReason) {
      updateData.comment = rejectReason;
    }

    await orderRepository.update(
      { id: parseInt(req.body.orderId) },
      updateData,
    );
    const orderDetails = await orderDetailRepository.find({
      where: { order: { id: parseInt(req.body.orderId) } },
      relations: ['order', 'product'],
    });
    const updatedOrderDetails = orderDetails.map((orderDetail) => {
      orderDetail.reviewed = true;
      return orderDetail;
    });

    await orderDetailRepository.save(updatedOrderDetails);

    res.redirect('/order/list');
    if (status === OrderStatus.Rejected || status === OrderStatus.Successful) {
      await sendEmail(status, rejectReason, email, orderDetails);
    }

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    cron.schedule(`0 0 ${sevenDaysLater.getDate()} ${sevenDaysLater.getMonth() + 1} *`, async () => {
      const resetOrderDetails = updatedOrderDetails.map(orderDetail => {
        orderDetail.reviewed = false;
        return orderDetail;
      });
      await orderDetailRepository.save(resetOrderDetails);
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// get filter status and date
export const getFilterOrderStatusAndDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);

    let queryBuilder = orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId: user.id })
      .skip(offset)
      .take(PAGE_SIZE)
      .orderBy('order.createdAt', 'DESC');

    let filterCondition = '';

    if (req.query.status) {
      const status = +req.query.status;
      if (status) {
        filterCondition += `status=${status}&`;
        queryBuilder = queryBuilder.andWhere('order.status = :status', {
          status,
        });
      }
    }
    if (req.query.dateInput) {
      const dateForm = req.query.dateInput;
      filterCondition += `dateInput=${dateForm}`;
      queryBuilder = queryBuilder.andWhere('order.createdAt LIKE :date', {
        date: `%${dateForm}%`,
      });
    }

    const [orderLists, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const modifiedOrderLists = orderLists.map((order) => {
      return {
        ...order,
        status: getStatusText(order.status),
        date: formatDate(order.createdAt),
      };
    });

    res.render('orderList', {
      modifiedOrderLists,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(
        page,
        totalPages,
        filterCondition,
      ),
    });
    return;
  } catch (err) {
    console.error(err);
    next();
  }
};
