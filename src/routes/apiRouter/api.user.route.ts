import express from 'express';
const router = express.Router();
import * as authController from '../../api/auth.api.controller';
import * as userController from '../../api/user.api.controller';
import * as manageUserController from '../../api/admin.user.api.controller';

// admin
router.get('/search', manageUserController.searchUser)
router.post('/changeStatus/:id', manageUserController.postChangeStatusUser)
router.get('/list', manageUserController.getListUser);

// user
router.post('/changePass',userController.postPasswordValidation, userController.postChangePass)
router.post('/edit', userController.handleUpload, userController.postRegisterValidation, userController.editDetailUser)

// auth
router.post('/register', authController.registerValidationRules, authController.registerHandler);
router.post('/login', authController.postLogin);
export default router;
