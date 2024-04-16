/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from "../config/database";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { OrderStatus, PAGE_SIZE, calculateOffset} from "../utils/constants";
import { OrderDetail } from "../entities/OrderDetail";
import { transporter } from '../index';
import { Product } from "../entities/Product";
import cron from 'node-cron';

const cartItemRepository = AppDataSource.getRepository(CartItem);
const orderRepository = AppDataSource.getRepository(Order);
const productRepository = AppDataSource.getRepository(Product);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);
export const getCartItemsWhenOrder = async (cartId: number, page: number) => {
  const offset = calculateOffset(page);
  const [cartItems, totalItems] = await cartItemRepository.findAndCount({
    where: { cart: { id: cartId } },
    relations: ['product'],
    take: PAGE_SIZE,
    skip: offset,
  });
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const rawResult = await cartItemRepository
    .createQueryBuilder('cartItem')
    .select('count(cartItem.id) as items')
    .addSelect('sum(cartItem.quantity * product.price) as total')
    .leftJoin('cartItem.product', 'product')
    .where('cartItem.cartId = :cartId', { cartId })
    .getRawOne();

  const { total, items } = rawResult;

  return { cartItems, total, items, totalPages };
};

// Hàm để lấy danh sách mục giỏ hàng
export const getCartItems = async (cart: Cart) => {
  return await cartItemRepository
    .createQueryBuilder('cartItem')
    .innerJoinAndSelect('cartItem.product', 'product')
    .where('cartItem.cartId = :cartId', { cartId: cart.id })
    .getMany();
};

export const getOrderListsByStatus = async (user: User, status: number, page: number) => {
  const offset = calculateOffset(page);
  const [orderLists, total] = await orderRepository.findAndCount({
    relations: ['user'],
    where: {
      user: { id: user.id },
      status: status,
    },
    take: PAGE_SIZE,
    skip: offset,
    order: { createdAt: 'DESC' },
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  return { orderLists, totalPages };
};

export const getUserOrderLists = async (user: User, page: number) => {
  const offset = calculateOffset(page);
  const [orderLists, total] = await orderRepository.findAndCount({
    relations: ['user'],
    where: { user: { id: user.id } },
    take: PAGE_SIZE,
    skip: offset,
    order: { createdAt: 'DESC' },
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  return { orderLists, totalPages };
};

export const updateOrderStatusAndSendEmail = async (
  orderId: number,
  status: OrderStatus,
  rejectReason: string,
  email: string,
) => {

  const orderDetails = await orderDetailRepository.find({
    where: { order: { id: orderId } },
    relations: ['order', 'product'],
  });

  const updateData: any = { status };
  if (status === OrderStatus.Rejected && rejectReason) {
    updateData.comment = rejectReason;
  }

  await orderRepository.update({ id: orderId }, updateData);

  const updatedOrderDetails = orderDetails.map((orderDetail) => {
    orderDetail.reviewed = true;
    return orderDetail;
  });
  await orderDetailRepository.save(updatedOrderDetails);

  if (status === OrderStatus.Rejected || status === OrderStatus.Successful) {
    await sendEmail(status, rejectReason, email, orderDetails);
  }

  if (status === OrderStatus.Successful) {
    await updateProductQuantities(orderDetails);
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

// Hàm để cập nhật số lượng sản phẩm khi order
const updateProductQuantities = async (orderDetails: OrderDetail[]) => {
  const products = orderDetails.map((orderDetail) => {
    const count = orderDetail.product.quantity - orderDetail.quantity;
    const product = new Product();
    product.id = orderDetail.product.id;
    product.quantity = count;
    product.numberSold = orderDetail.product.numberSold + orderDetail.quantity; 
    return product;
  });
  return await Promise.all(
    products.map((product) => {
      return productRepository.update(
        { id: product.id },
        { quantity: product.quantity, numberSold: product.numberSold},
      );
    }),
  );
};
