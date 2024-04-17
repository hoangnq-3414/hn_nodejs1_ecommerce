import { AppDataSource } from "../config/database";
import { Order } from "../entities/Order";
import { OrderDetail } from "../entities/OrderDetail";
import { PAGE_SIZE, calculateOffset } from "../utils/constants";

const orderRepository = AppDataSource.getRepository(Order);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);

export const getOrderListByStatus = async (status: number, page: number) => {
  const offset = calculateOffset(page);
  const [orderLists, total] = await orderRepository.findAndCount({
    relations: ['user'],
    where: { status },
    take: PAGE_SIZE,
    skip: offset,
    order: { createdAt: 'DESC' },
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  return {orderLists, totalPages};
};

export const getOrderDetail = async (orderId: number, page: number) => {
  const offset = calculateOffset(page);
  const [orderDetail, totalItems] = await orderDetailRepository.findAndCount({
    where: { order: { id: orderId } },
    relations: ['product', 'order'],
    take: PAGE_SIZE,
    skip: offset,
  });
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  return { orderDetail, totalPages };
};


export const getAdminOrderList = async (page: number) => {
  const offset = calculateOffset(page);
  const [orderLists, total] = await orderRepository.findAndCount({
    relations: ['user'],
    take: PAGE_SIZE,
    skip: offset,
    order: { createdAt: 'DESC' },
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  return { orderLists, totalPages };
};
