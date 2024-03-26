import express from 'express';
const router = express.Router();
import * as userController from '../controllers/admin.user.controller';

router.get('/search', userController.searchUser)
router.delete('/delete/:id', userController.deleteUser);
router.post(
  '/create',
  userController.handleUpload,
  userController.postRegisterValidation,
  userController.postCreateUser,
);

router.put(
  '/create',
  userController.handleUpload,
  userController.postRegisterValidation,
  userController.editUser,
);

router.get('/list', userController.getListUser);

export default router;
