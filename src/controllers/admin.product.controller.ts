/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { DEFAULT_PAGE, checkAdmin } from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { Category } from '../entities/Category';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';
import { createProduct, getListProductForAdmin, saveSecondaryImages, searchProduct, updateMainProduct, updateProductStatus, updateSecondaryImages } from '../service/admin.product.service';

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);

// Get list product
export const getListProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;

    const { listProduct, totalPages } = await getListProductForAdmin(page);
    res.render('admin/manageProduct', {
      listProduct,
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
    });
  } catch (error) {
    console.error(error);
    next();
  }
};

// vo hieu hoa hoac kich hoat san pham
export const postChangeStatusProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = +req.params.id;
    const { disable } = req.body;
    await updateProductStatus(id, disable);
    return res
      .status(200)
      .json({ message: 'Product status updated successfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET search product
export const getSearchProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const text = req.query.text;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    let filterCondition = '';
    filterCondition += `text=${text}&`;
    const { listProduct, totalPages } = await searchProduct(text, page);
    res.render('admin/manageProduct', {
      listProduct,
      totalPages: totalPages,
      currentPage: page,
      paginationItemsLinks: generatePaginationLinks(
        page,
        totalPages,
        filterCondition,
      ),
    });
  } catch (err) {
    console.error(err);
    next();
  }
};

//get view create product
export const getCreateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const listCategory = await categoryRepository.find();
    res.render('admin/updateProduct', { listCategory });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// create product
export const postCreateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { body, files } = req;
    const newProduct = await createProduct(body);
    await saveSecondaryImages(newProduct, files['images-second']);
    return res.status(200).json({ message: req.t('product.productCreateSuccess') });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const storage = multer.diskStorage({
  destination: './src/public/upload',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

export const uploadImages = (req, res, next) => {
  upload.fields([
    { name: 'primary-image', maxCount: 1 },
    { name: 'images-second', maxCount: 10 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Multer error: ' + err.message });
    } else if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    next();
  });
};

// Get detail product
export const getUpdateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = +req.params.id;
    const productDetail = await productRepository.findOne({
      where: { id: id },
      relations: ['category', 'productImages'],
    });
    const listCategory = await categoryRepository.find();
    res.render('admin/updateProduct', { ...productDetail, listCategory });
  } catch (error) {
    console.error(error);
    next();
  }
};

// update product
export const putUpdateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({ errors: errors.array() });
  }
  try {

    const { id } = req.body;
    await updateMainProduct(id, req.body);
    await updateSecondaryImages(id, req.files['images-second']);    
    return res.status(200).json({ message: req.t('product.productUpdateSuccess') });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postCreateValidation = [
  body('name')
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('order.nameLength')),
  body('description')
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('order.descriptionLength')),
  body('price')
    .notEmpty()
    .withMessage(() => i18next.t('order.priceEmpty')),
  body('quantity')
    .notEmpty()
    .withMessage(() => i18next.t('order.quantityEmpty')),
  body('unit')
    .notEmpty()
    .withMessage(() => i18next.t('order.unitLength'))
];
