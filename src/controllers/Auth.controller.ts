/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import i18next from 'i18next';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { checkPassword, decodeJWT } from '../utils/auth';
import { ROLEADMIN } from '../utils/constants';
import { RegistrationResult, findUserByEmail, registerUser } from '../service/auth.service';

// POST register
  export const postRegister = [
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
    asyncHandler(async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('register', {
          errors: errors.array(),
        });
        return;
      }
      const { fullName, password, email } = req.body;
      try {
        const registrationResult: RegistrationResult = await registerUser(fullName, email, password);
        res.render('register', { accountCreated: true });
      } catch (error) {
        console.error(error);
      }
    }),
  ];


// POST Login
export const postLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await findUserByEmail(email);
      if (!user) {
        req.flash('notfound', req.t('login.notfound'));
        res.redirect('/auth/login');
        return;
      }

      const isMatch = await checkPassword(password, user.password);
      if (!isMatch) {
        req.flash('error', req.t('login.error'));
        res.redirect('/auth/login');
        return;
      }
      // @ts-ignore
      req.session.user = user;
      if(user.role === ROLEADMIN){
        res.redirect('/report/dashboard');
        return;
      }
      
      if(user.disable === true){
        res.render('login',{ accountDisable: true });
        return;
      }
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
);

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
    }
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
