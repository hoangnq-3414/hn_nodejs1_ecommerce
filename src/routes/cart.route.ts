import express from 'express';
const router = express.Router();
import * as cartController from '../controllers/Cart.controller'

router.get('/list', cartController.getListItemCart)
router.post('/add/:id', cartController.postAddCart);

export default router;
