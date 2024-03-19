import express from 'express';
import * as productController from '../controllers/Product.controller';
const router = express.Router();

router.get('/test', (req, res) => {
  res.render('product');
});
router.get('/detail/:id', productController.getProductDetail);
export default router;
