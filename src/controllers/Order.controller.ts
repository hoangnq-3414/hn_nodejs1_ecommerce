/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
import i18next from 'i18next';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { body, validationResult } from 'express-validator';
import { AppDataSource } from '../config/database';
import { PAGE_SIZE, calculateOffset } from '../untils/constants';
import { generatePaginationLinks } from '../untils/pagenation';
import { upload } from '../index';
import { Order } from '../entities/Order';
import { OrderDetail } from '../entities/OrderDetail';
import { Cart } from '../entities/Cart';
import { Product } from '../entities/Product';
import { CartItem } from '../entities/CartItem';
import { checkLoggedIn } from '../untils/auth'
import { User } from '../entities/User';
import { Transactional, runOnTransactionCommit, runOnTransactionRollback } from 'typeorm-transactional';


const orderRepository = AppDataSource.getRepository(Order);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);
const productRepository = AppDataSource.getRepository(Product);

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
    const cart = await getUserCart(user.id, res);
    const page = parseInt(req.query.page as string) || 1;
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
    const order = await createOrder({name, phone, address, typeOrder, totalAmount, imagePath}, user);
    await orderRepository.save(order);

    const cart = await getUserCart(user.id, res);
    const cartItems = await getCartItems(cart);

    await createOrderDetails(order, cartItems);
    await updateProductQuantities(cartItems);
    await deleteCartItems(cart);

    runOnTransactionRollback(() => console.log('rollbacked'));
    runOnTransactionCommit(() => console.log('committed'));

    res.redirect('/order/success');
  }
}

// Hàm để tạo đơn hàng
const createOrder = async (options={}, user: User) => {
  const order: Order = orderRepository.create({
    ...options,
    status: 1,
    user,
  });
  return order;
}

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
  const orderDetails = cartItems.map(cartItem => {
    return orderDetailRepository.create({
      ...cartItem,
      price: cartItem.product.price,
      order,
    });
  });

  return await orderDetailRepository.save(orderDetails);
};

// Hàm để cập nhật số lượng sản phẩm
const updateProductQuantities = async (cartItems: CartItem[]) => {
  const products = cartItems.map(cartItem => {
    const count = cartItem.product.quantity - cartItem.quantity;
    const product = new Product();
    product.id = cartItem.product.id;
    product.quantity = count;
    return product;
  });
  return await Promise.all(
    products.map((product) => {
      return productRepository.update(
        { id: product.id },
        { quantity: product.quantity },
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
      const imagePath = path.join('/upload', req.file.path.split('/upload')[1]);
      await ProcessOrder.processOrder(req, res, imagePath);
    } else {
      await ProcessOrder.processOrder(req, res, '');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
