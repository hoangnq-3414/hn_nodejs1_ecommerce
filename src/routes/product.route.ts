import express from 'express';
import * as productController from '../controllers/Product.controller'
const router = express.Router();

router.get('/search', productController.getSearchProduct)
router.get('/detail/:id', productController.getProductDetail )
export default router;
