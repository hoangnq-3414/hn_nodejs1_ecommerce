/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import i18next from 'i18next';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { checkPassword, decodeJWT } from '../utils/auth';
import { ROLEADMIN, ROLEUSER } from '../utils/constants';
import {
  RegistrationResult,
  findUserByEmail,
  registerUser,
} from '../service/auth.service';

export const validateRegister = [
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('register.passwordLengthError')),
  body('confirmPassword')
    .notEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(i18next.t('register.passwordMismatchError'));
      }
      return true;
    }),
  body('email')
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage(() => i18next.t('register.invalidEmailError')),
  body('fullName')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('register.fullNameLengthError')),
];

export const handleRegister = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({ message: errorMessages });
    return;
  }
  const { fullName, password, email } = req.body;
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const registrationResult = await registerUser(fullName, email, password);
    res.status(201).json({ message: 'User registered successfully', user: registrationResult.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: req.t('login.notfound') });
    }

    const isMatch = await checkPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: req.t('login.error') });
    }
    
    if (user.disable === true) {
      return res.status(200).json({ accountDisable: true });
    }

    // @ts-ignore
    req.session.user = user;

    if (user.role === ROLEADMIN) {
      return res.status(200).json({ redirectUrl: '/report/dashboard' });
    }

    if (user.role === ROLEUSER) {
      return res.status(200).json({ redirectUrl: '/' });
    }


    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};


// GET Logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('connect.sid');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET register
export const getRegister = asyncHandler(async (req: Request, res: Response) => {
  res.render('register', {
    flash: {
      exited: req.flash('existed'),
    },
  });
});

// GET login
export const getLogin = asyncHandler(async (req: Request, res: Response) => {
  res.render('login', {
    flash: {
      notfound: req.flash('notfound'),
      error: req.flash('error'),
    },
  });
});

// Middleware để xác thực và phân quyền JWT
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash('error', i18next.t('login.notLogin'));
  }
  try {
    const decoded = await decodeJWT(token);
    if (decoded) {
      next();
    }
  } catch (error) {
    console.error(error.message);
    req.flash('error', i18next.t('login.invalid'));
  }
};
