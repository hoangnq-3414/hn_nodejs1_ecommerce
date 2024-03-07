import express from 'express';
import authRouter from './auth.route';
import { Request, Response, NextFunction } from 'express';
const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.render('home');
});

router.use('/auth', authRouter);

export default router;
