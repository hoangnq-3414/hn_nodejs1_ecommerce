import { body, validationResult } from 'express-validator';
import i18next from 'i18next';
import { findUserByEmail, registerUser } from '../service/auth.service';
import { checkPassword } from '../utils/auth';
import { ROLEADMIN, ROLEUSER } from '../utils/constants';

export const registerValidationRules = [
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
    .isEmail()
    .withMessage(() => i18next.t('register.invalidEmailError')),
  body('fullName')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('register.fullNameLengthError')),
];

export const registerHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { fullName, password, email } = req.body;
  try {
    const registrationResult = await registerUser(fullName, email, password);
    res.status(200).json({ registrationResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: req.t('login.notfound') });
    }

    const isMatch = await checkPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: req.t('login.error') });
    }

    if (user.disable === true) {
      return res.status(403).json({ message: 'Account is disabled' });
    }
    // @ts-ignore
    req.session.user = user;

    if (user.role === ROLEADMIN) {
      return res.status(200).json({  message: 'Admin login successful' });
    }

    if (user.role === ROLEUSER) {
      return res.status(200).json({  message: 'User login successful' });
    }

  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
