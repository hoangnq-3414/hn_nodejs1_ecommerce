import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { checkAdmin, getDaysInMonth, getFirstAndLastDayOfMonth } from '../utils/constants';
import { OrderDetail } from '../entities/OrderDetail';
import { Product } from '../entities/Product';
import { User } from '../entities/User';

const orderRepository = AppDataSource.getRepository(Order);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

// GET chart
export const getChart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    res.render('reportChart');
  } catch (err) {
    next(err);
  }
};

// POST report amountTotal
export const postChart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const month = req.body.date;
    const type = req.body.type;

    const queryBuilder = orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.updatedAt) AS orderDate')
      .where("DATE_FORMAT(order.updatedAt, '%Y-%m') = :month", { month })
      .andWhere('order.status = :status', { status: 2 })
      .groupBy('orderDate')
      .orderBy('orderDate');

    if (type === '1') {
      queryBuilder.addSelect('SUM(order.totalAmount) AS result');
    } else {
      queryBuilder
        .select('DATE(order.updatedAt) AS orderDate')
        .addSelect('SUM(orderDetail.quantity) AS result')
        .leftJoin('order.orderDetails', 'orderDetail');
    }

    const results = await queryBuilder.getRawMany();

    const formattedResult = results
      .map((item) => ({
        orderDate: new Date(item.orderDate).toISOString().substring(0, 10),
        result: item.result,
      }))
      .sort((a, b) => a.orderDate.localeCompare(b.orderDate));

    const monthDays = getDaysInMonth(new Date(month));
    const resultWithZeroRevenue = monthDays.map((day) => {
      const found = formattedResult.find((item) => item.orderDate === day);
      return found ? found : { orderDate: day, result: 0 };
    });

    const dailyRevenues = resultWithZeroRevenue.map((item) => item.result);

    const [year, monthTime] = month.split('-');

    const responseJSON = {
      dailyRevenues: dailyRevenues,
      year,
      monthTime,
    };

    res.json(responseJSON);
  } catch (err) {
    next(err);
  }
};

export const postTopProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // await checkAdmin(req, res);
    const { startDate, endDate, type } = req.body;
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);

    let queryBuilder = orderDetailRepository
      .createQueryBuilder('orderDetail')
      .innerJoin('orderDetail.order', 'order')
      .innerJoin('orderDetail.product', 'product')
      .where('order.dateOrder BETWEEN :startDate AND :endDate', {
        startDate: startDateObj,
        endDate: endDateObj,
      })
      .groupBy('product.id');

    if (type === '1') {
      queryBuilder = queryBuilder
        .select([
          'product.name AS productName',
          'SUM(orderDetail.quantity * orderDetail.price) AS revenue',
        ])
        .orderBy('revenue', 'DESC');
    } else if (type === '2') {
      queryBuilder = queryBuilder
        .select([
          'product.name AS productName',
          'SUM(orderDetail.quantity) AS totalQuantity', // Tính tổng số lượng sản phẩm bán được
        ])
        .orderBy('totalQuantity', 'DESC');
    }
    const result = await queryBuilder.getRawMany();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productRepository
      .createQueryBuilder('product')
      .select([
        'SUM(product.price * product.numberSold) AS totalSales',
        'COUNT(product.id) AS totalProduct',
        'COUNT(CASE WHEN product.numberSold > 0 THEN 1 END) AS soldProductsCount',
        'COUNT(productReview.id) AS productReviewCount', 
      ])
      .leftJoin('product.productReviews', 'productReview') 
      .getRawOne();

    const userCount = await userRepository.count();

    const currentDate = new Date();
    const { firstDayOfMonth, lastDayOfMonth } = getFirstAndLastDayOfMonth(currentDate);
    const revenuOfMonth = await orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .where('order.status = :status', { status: 2 })
      .andWhere('order.dateOrder >= :firstDayOfMonth AND order.dateOrder <= :lastDayOfMonth', {
        firstDayOfMonth,
        lastDayOfMonth,
      })
      .getRawOne();
    res.render('admin/dashboard', {...product, userCount, ...revenuOfMonth});
  } catch (err) {
    next(err);
  }
};
