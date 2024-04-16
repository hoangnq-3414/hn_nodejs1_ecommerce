/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { PAGE_SIZE, calculateOffset, DEFAULT_PAGE, formatDate, getStatusText, checkAdmin } from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { getAdminOrderList, getOrderDetail, getOrderListByStatus } from '../service/admin.order.service';

const orderRepository = AppDataSource.getRepository(Order);

export const getAllOderListByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkAdmin(req, res);
    const status = parseInt(req.params.status);
    let isPending = false

    if (parseInt(req.params.status) == 1){
      isPending = true;
    }
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const {orderLists, totalPages} = await getOrderListByStatus(status, page);
    const modifiedOrderLists = orderLists.map((order) => {
      return {
        ...order,
        status: getStatusText(order.status),
        date: formatDate(order.createdAt),
        isPending
      };
    });

    res.render('admin/order', {
      modifiedOrderLists,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(page, totalPages)
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
    const orderId = parseInt(req.params.id);
    const { orderDetail, totalPages } = await getOrderDetail(orderId, page);
    const order = orderDetail[0].order;

    res.render('admin/orderDetail', {
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
      orderDetail,
      order
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// get ADMIN filter status and date
export const getAllFilterOrderStatusAndDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);

    let queryBuilder = orderRepository
      .createQueryBuilder('order')
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

    res.render('orderManage', {
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

// GET list view ADMIN history order
export const getAdminAllOderList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const { orderLists, totalPages } = await getAdminOrderList(page);
    const modifiedOrderLists = orderLists.map((order) => {
      return {
        ...order,
        status: getStatusText(order.status),
        date: formatDate(order.createdAt),
      };
    });

    res.render('admin/order', {
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
