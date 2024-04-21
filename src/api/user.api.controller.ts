import { Request, Response } from 'express';
import { buildUpdateFields, getUser } from '../service/user.service';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { checkLoggedIn, checkPassword, hashPassword } from '../utils/auth';
import i18next from 'i18next';
import { upload } from '../index';

const userRepository = AppDataSource.getRepository(User);

export const getDetailUser = async (req: Request, res: Response) => {
  try {
    const user = await checkLoggedIn(req, res);
    const detailUser = await getUser(user.id);
    res.status(200).json(detailUser);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const editDetailUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length) {
      return res.status(400).json({
        message: errors.reduce((preValue: string, currValue: any) => {
          return currValue.msg !== 'Invalid value'
            ? `${preValue}\n${currValue.path}: ${currValue.msg}`
            : preValue;
        }, ''),
      });
    }

    const user = await checkLoggedIn(req, res);
    const { address, fullName, phone } = req.body;
    let imagePath = '';

    if (req.file && req.file.path) {
      const uploadDir = path.resolve(__dirname, '../public/upload');
      const relativePath = path.relative(uploadDir, req.file.path);
      imagePath = '/upload/' + relativePath;
    }

    const updateFile = await buildUpdateFields(
      user,
      address,
      fullName,
      phone,
      imagePath,
    );
    return res.status(200).json({ updateFile });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const postChangePass = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length) {
      return res.status(400).json({
        message: errors.reduce((preValue: string, currValue: any) => {
          return currValue.msg !== 'Invalid value'
            ? `${preValue}\n${currValue.path}: ${currValue.msg}`
            : preValue;
        }, ''),
      });
    }

    const user = await checkLoggedIn(req, res);
    const password = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const isMatch = await checkPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    } else {
      const hashedPassword = await hashPassword(newPassword);
      await userRepository.update(
        { id: user.id },
        { password: hashedPassword },
      );
      return res.status(200).json({ message: 'Password changed successfully' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const postRegisterValidation = [
  body('email')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('register.invalidEmailError')),
  body('fullName')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('register.fullNameLengthError')),
  body('address')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('register.addressLengthError')),
  body('phone')
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage(() => i18next.t('register.phoneLengthError')),
];

export const postPasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('register.passwordLengthError')),
  body('newPassword')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('register.passwordLengthError')),
];

// Handle multipart/form-data trước khi kiểm tra dữ liệu
export const handleUpload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ message: req.t('home.uploadError') });
    }
    next();
  });
};
