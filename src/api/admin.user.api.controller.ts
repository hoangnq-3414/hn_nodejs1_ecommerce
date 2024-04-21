import { Request, Response } from 'express';
import { DEFAULT_PAGE, checkAdmin } from '../utils/constants';
import {
  changeUserStatus,
  getListUserForManage,
  searchUserWithText,
} from '../service/admin.user.service';

export const getListUser = async (req: Request, res: Response) => {
  try {
    await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;

    const { listUser, totalPages } = await getListUserForManage(page);

    res.status(200).json({ listUser, totalPages });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  try {
    await checkAdmin(req, res);
    const text = req.query.text as string;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    let filterCondition = '';
    filterCondition += `text=${text}&`;

    const { listUser, totalPages } = await searchUserWithText(
        text,
      page,
    );
    res.status(200).json({ listUser, totalPages });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const postChangeStatusUser = async (req: Request, res: Response) => {
  try {
    await checkAdmin(req, res);
    const id = +req.params.id;
    const { disable } = req.body;
    await changeUserStatus(id, disable);
    return res
      .status(200)
      .json({ message: 'User status updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
