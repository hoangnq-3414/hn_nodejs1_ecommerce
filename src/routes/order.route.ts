import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();
import * as orderController from '../controllers/Order.controller';
import * as adminOrderController from '../controllers/admin.order.controller';

// admin
router.get('/OrderByStatus/:status', adminOrderController.getAllOderListByStatus);
router.get('/allFilter', adminOrderController.getAllFilterOrderStatusAndDate)
router.get('/allList', adminOrderController.getAdminAllOderList);
router.get('/detail/:id', adminOrderController.getOderDetail);
// user
router.get('/ByStatusOfUser/:status', orderController.getAllOderListByStatusOfUser);
router.get('/userAllList', orderController.getUserAllOderList);
router.get('/filter', orderController.getFilterOrderStatusAndDate);
router.post('/status', orderController.postChangeStatusOrder);
router.get('/detailOfUser/:id', orderController.getUserOderDetail);
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


