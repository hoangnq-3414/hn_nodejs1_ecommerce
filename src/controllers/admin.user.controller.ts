/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import {
  DEFAULT_PAGE,
  PAGE_SIZE,
  ROLEUSER,
  calculateOffset,
  checkAdmin,
} from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { upload } from '../index';
import path from 'path';
import { hashPassword } from '../utils/auth';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';
const userRepository = AppDataSource.getRepository(User);

// GET list User
export const getListUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [listUser, totalUser] = await userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: ROLEUSER })
      .orderBy({
        'user.disable': 'ASC',
        'user.id': 'ASC' 
      })
      .skip(offset)
      .take(PAGE_SIZE)
      .getManyAndCount();

    const totalPages = Math.ceil(totalUser / PAGE_SIZE);

    res.render('admin/manageUser', {
      listUser,
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

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

// PUT admin edit user
export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return;
    }
    const { id, email, fullName, password } = req.body;
    const hashedPassword = await hashPassword(password);
    let imagePath = '';

    if (req.file && req.file.path) {
      const uploadDir = path.resolve(__dirname, '../public/upload');
      const relativePath = path.relative(uploadDir, req.file.path);
      imagePath = '/upload/' + relativePath;
    }

    let updateFields: { [key: string]: any } = {
      email,
      fullName,
      password: hashedPassword,
    };

    if (imagePath !== '') {
      updateFields.image = imagePath;
    }
    await userRepository.update({ id: parseInt(id) }, updateFields);
    res.status(200).json({ message: req.t('user.accountUpdateSuccess') });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST admin create user
export const postCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return;
    }
    const { email, fullName, password } = req.body;
    const hashedPassword = await hashPassword(password);
    let imagePath = '';

    if (req.file && req.file.path) {
      const uploadDir = path.resolve(__dirname, '../public/upload');
      const relativePath = path.relative(uploadDir, req.file.path);
      imagePath = '/upload/' + relativePath;
    }
    const user = await userRepository.create({
      email,
      fullName,
      password: hashedPassword,
      role: 1,
      image: imagePath,
    });
    await userRepository.save(user);
    res.status(200).json({ message: req.t('register.registerSuccess') });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const postRegisterValidation = [
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('register.passwordLengthError')),
  body('email')
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage(() => i18next.t('register.invalidEmailError')),
  body('fullName')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('register.fullNameLengthError')),
];

// [DELETE] admin detele user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const userId = parseInt(req.params.id);
    await userRepository.update({ id: userId }, { role: 0 });
    res.status(200);
  } catch (error) {
    console.error(error);
    next(error);
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
    const offset = calculateOffset(page);
    let filterCondition = '';
    filterCondition += `text=${text}&`;
    const [listUser, totalUser] = await userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :email OR user.fullName LIKE :fullName', {
        email: `%${text}%`,
        fullName: `%${text}%`,
      })
      .skip(offset)
      .take(PAGE_SIZE)
      .getManyAndCount();

    const totalPages = Math.ceil(totalUser / PAGE_SIZE);
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
    if (disable) {
      await userRepository.update({ id: id }, { disable: true });
    } else {
      await userRepository.update({ id: id }, { disable: false });
    }
    return res
      .status(200)
      .json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
