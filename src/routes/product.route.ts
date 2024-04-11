import express from 'express';
import * as productController from '../controllers/Product.controller';
import * as adminProductController from '../controllers/admin.product.controller';
const router = express.Router();

// admin
router.get('/manage', adminProductController.getListProduct);
router.post('/changeStatus/:id', adminProductController.postChangeStatusProduct)
router.get('/searchProduct', adminProductController.getSearchProduct);
router.get('/createProduct', adminProductController.getCreateProduct);
router.post('/createProduct', adminProductController.uploadImages, adminProductController.postCreateValidation, adminProductController.postCreateProduct)
router.get('/update/:id', adminProductController.getUpdateProduct);
router.put('/update',adminProductController.uploadImages, adminProductController.postCreateValidation, adminProductController.putUpdateProduct);

// user
router.get('/topSelling', productController.getSellingProduct);
router.get('/comment', productController.getRatingInProduct);
router.get('/ratingProductOfUser', productController.getRatingProductOfUser);
router.get('/ratingInProduct', productController.getRatingInProduct);
router.post('/rating', productController.postRatingProduct);
router.get('/search', productController.getSearchProduct);
router.get('/detail/:id', productController.getProductDetail);
router.post('/multisearch', productController.multiSearch);
router.get('/', productController.getHome);
export default router;
