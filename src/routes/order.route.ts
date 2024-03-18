import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();
import * as orderController from '../controllers/Order.controller';

router.post('/status', orderController.postChangeStatusOrder)
router.get('/list', orderController.getOderList);
router.get('/detail/:id', orderController.getOderDetail);
router.get('/success', (req: Request, res: Response) => {
  res.render('success');
});
router.post(
  '/',
  orderController.handleUpload,
  orderController.validateOrder,
  orderController.postOrder,
);
router.get('/', orderController.getListItemOrder);

export default router;


