import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';
import { checkPassword, generateToken, hashPassword, decodeJWT } from '../untils/auth';

const userRepository = AppDataSource.getRepository(User);

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
  asyncHandler(async (req: Request, res: Response, next: NextFunction,
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('register', {
        errors: errors.array(),
      });
      return;
    }

    const { fullName, password, email } = req.body;

    try {
      const user = await userRepository.findOne({
        where: { email: email },
      });
      if (user) {
        req.flash('existed', i18next.t('register.existed'));
        res.redirect('/auth/register')
      }
      const hashedPassword = await hashPassword(password);
      const newUser = new User();
      newUser.password = hashedPassword;
      newUser.email = email;
      newUser.fullName = fullName;
      newUser.role = 1;

      await userRepository.save(newUser);

      res.redirect('/auth/login');
    } catch (error) {
      console.error(error);
    }
  }),
];

// POST Login
export const postLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      req.flash('notfound', req.t('login.notfound'));
      res.redirect('/auth/login');
      return;
    }

    const isMatch = await checkPassword(password, user.password);
    if (!isMatch) {
      req.flash('error', req.t('login.error'));
      res.redirect('/auth/login')
      return;
    }

    const token = await generateToken(user.id);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Xóa cookie chứa token trên client
      res.clearCookie('token');
    } catch (error) {
      console.error(error);
    }
  },
);

// GET register
export const getRegister = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render('register');
  },
);

// GET login
export const getLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render('login', {
      flash: {
        notfound: req.flash('notfound'),
        error: req.flash('error'),
      }
    });
  },
);

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
