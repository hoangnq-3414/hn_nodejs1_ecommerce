import express from 'express';
import * as productController from '../controllers/Product.controller';
const router = express.Router();

router.get('/comment', productController.getRatingInProduct);
router.get('/ratingProductOfUser', productController.getRatingProductOfUser);
router.get('/ratingInProduct', productController.getRatingInProduct);
router.post('/rating', productController.postRatingProduct);
router.get('/search', productController.getSearchProduct);
router.get('/detail/:id', productController.getProductDetail);
router.post('/multisearch', productController.multiSearch);
router.get('/', productController.getHome);
export default router;
