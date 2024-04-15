/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import {
  DEFAULT_PAGE,
  checkAdmin,
} from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { changeUserStatus, getListUserForManage, searchUserWithText } from '../service/admin.user.service';

// GET list User
export const getListUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;

    const { listUser, totalPages } = await getListUserForManage(page);

    res.render('admin/manageUser', {
      listUser,
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// search user
export const searchUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const text = req.query.text;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    let filterCondition = '';
    filterCondition += `text=${text}&`;

    const { listUser, totalPages } = await searchUserWithText(filterCondition, page);
    res.render('admin/manageUser', {
      listUser,
      paginationItemsLinks: generatePaginationLinks(
        page,
        totalPages,
        filterCondition,
      ),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// vo hieu hoa hoac kich hoat tai khoan
export const postChangeStatusUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = +req.params.id;
    const { disable } = req.body;
    await changeUserStatus(id, disable);
    return res
      .status(200)
      .json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
