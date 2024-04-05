import express from 'express';
import authRouter from './auth.route';
import productRouter from './product.route';
import cartRouter from './cart.route';
import orderRouter from './order.route';
import userRouter from './user.route';
import reportRouter from './report.route';
import categoryRouter from './category.route';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/test', (req: Request, res: Response) => {
  res.render('admin/manageCategory')
})

router.use('/category', categoryRouter);
router.use('/report', reportRouter);
router.use('/user', userRouter);
router.use('/order', orderRouter);
router.use('/cart', cartRouter);
router.use('/product', productRouter);
router.use('/auth', authRouter);
router.use('/', productRouter)

export default router;
