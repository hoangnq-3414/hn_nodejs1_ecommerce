/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { upload } from '../index';
import path from 'path';
import { checkLoggedIn, checkPassword, hashPassword } from '../utils/auth';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';
const userRepository = AppDataSource.getRepository(User);

// GET Detail User
export const getDetailUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const newUser = await userRepository.findOne({
      where: {id :+ user.id}
    })
    res.render('profileUser', { ...newUser });
  } catch (err) {
    next(err);
  }
};

// Handle multipart/form-data trước khi kiểm tra dữ liệu
export const handleUpload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ message: req.t('home.uploadError') });
    }
    next();
  });
};

// POST edit user
export const editDetailUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length) {
      res.status(200).json({
        message: errors.reduce((preValue: string, currValue: any) => {
          return currValue.msg !== 'Invalid value'
            ? `${preValue}\n${currValue.path}: ${currValue.msg}`
            : preValue;
        }, ''),
      });
      return;
    }
    const user = await checkLoggedIn(req, res);
    const { email, address, fullName, phone } = req.body;
    let imagePath = '';

    if (req.file && req.file.path) {
      const uploadDir = path.resolve(__dirname, '../public/upload');
      const relativePath = path.relative(uploadDir, req.file.path);
      imagePath = '/upload/' + relativePath;
    }
    let updateFields: { [key: string]: any } = {
      email,
      fullName,
      address,
      phone,
    };

    if (imagePath !== '') {
      updateFields.image = imagePath;
    }

    await userRepository.update({ id: parseInt(user.id) }, updateFields);
    res.status(200).json({ message: req.t('user.accountUpdateSuccess') });
  } catch (error) {
    next(error);
  }
};

export const postRegisterValidation = [
  body('email')
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage(() => i18next.t('register.invalidEmailError')),
  body('fullName')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('register.fullNameLengthError')),
  body('address')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('register.fullNameLengthError')),
  body('phone')
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage(() => i18next.t('register.fullNameLengthError')),
];

// GET change password
export const getChangePass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    res.render('changePass');
  } catch (err) {
    next(err);
  }
};

// GET change password
export const postChangePass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length) {
      res.status(200).json({
        message: errors.reduce((preValue: string, currValue: any) => {
          return currValue.msg !== 'Invalid value'
            ? `${preValue}\n${currValue.path}: ${currValue.msg}`
            : preValue;
        }, ''),
      });
      return;
    }
    const user = await checkLoggedIn(req, res);
    const password = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const isMatch = await checkPassword(password, user.password);
    if (!isMatch) {
      res.status(200).json({ message: req.t('register.oldPasswordIncorrect') });
      return;
    } else {
      const hashedPassword = await hashPassword(newPassword);
      await userRepository.update(
        { id: user.id },
        { password: hashedPassword },
      );
      res.status(200).json({ message: req.t('register.passwordChangedSuccessfully') })
    }
    return;
  } catch (err) {
    next(err);
  }
};

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
