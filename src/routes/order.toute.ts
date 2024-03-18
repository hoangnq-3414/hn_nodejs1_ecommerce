import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();
import * as orderController from '../controllers/Order.controller';

// get list order
router.get('/list', orderController.getOderList);

// get order success
router.get('/success', (req: Request, res: Response) => {
  res.render('success');
});

// post order
router.post(
  '/',
  orderController.handleUpload,
  orderController.validateOrder,
  orderController.postOrder,
);

// get list item in order
router.get('/', orderController.getListItemOrder);
export default router;

// get order detail
router.get('/detail/:id', orderController.getOderDetail);
