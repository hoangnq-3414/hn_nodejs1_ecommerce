import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { DEFAULT_PAGE, checkAdmin } from '../utils/constants';
import { Category } from '../entities/Category';
import { validationResult } from 'express-validator';
import {
  createProduct,
  getListProductForAdmin,
  saveSecondaryImages,
  searchProduct,
  updateProductStatus,
} from '../service/admin.product.service';

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);

export const getListProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;

    const { listProduct, totalPages } = await getListProductForAdmin(page);
    res.status(200).json({ listProduct, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const postChangeStatusProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = +req.params.id;
    const { disable } = req.body;
    await updateProductStatus(id, disable);
    res.status(200).json({ message: 'Product status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getSearchProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const text = req.query.text;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const { listProduct, totalPages } = await searchProduct(text, page);
    res.status(200).json({ listProduct, totalPages, currentPage: page });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getCreateProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const listCategory = await categoryRepository.find();
    res.status(200).json({ listCategory });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const postCreateProduct = async (
  req: Request,
  res: Response,
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
    return res
      .status(200)
      .json({ message: req.t('product.productCreateSuccess') });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getUpdateProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = +req.params.id;
    const productDetail = await productRepository.findOne({
      where: { id: id },
      relations: ['category', 'productImages'],
    });
    const listCategory = await categoryRepository.find();
    res.status(200).json({ productDetail, listCategory });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};
