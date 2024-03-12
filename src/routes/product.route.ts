import express from 'express';
import * as productController from '../controllers/Product.controller'
const router = express.Router();

router.get('/detail/:id', productController.getProductDetail )
export default router;
