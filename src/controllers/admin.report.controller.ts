import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { checkAdmin, getDaysInMonth } from '../utils/constants';

const orderRepository = AppDataSource.getRepository(Order);

// GET chart
export const getChart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    res.render('reportChart')
  } catch(err) {
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


