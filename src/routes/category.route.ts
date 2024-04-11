import express from 'express';
const router = express.Router();
import * as categoryController from '../controllers/admin.category.controller';

router.get('/search', categoryController.searchCategory);
router.post('/create', categoryController.postCreateValidation, categoryController.postCreateCategory);
router.put('/create', categoryController.postCreateValidation, categoryController.putCategory);
// [GET] list category
router.get('/', categoryController.getListCategory);
router.post('/changeStatus/:id', categoryController.postChangeStatusCategory)

export default router;
