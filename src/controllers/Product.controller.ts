import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import {
  DEFAULT_PAGE,
  PAGE_SIZE,
  calculateOffset
} from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { ProductReview } from '../entities/ProductReview';
import { OrderDetail } from '../entities/OrderDetail';
import { checkLoggedIn } from '../utils/auth';

const productRepository = AppDataSource.getRepository(Product);
const productReviewRepository = AppDataSource.getRepository(ProductReview);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);

// GET product detail
export const getProductDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['category', 'productImages', 'productReviews'],
    });
    if (!product) {
      req.flash('notfound', req.t('detail.notfound'));
      res.redirect('/');
      return;
    }
    res.render('detail', { product: product });
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
    const searchText = req.query.searchText;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [products, total] = await productRepository
      .createQueryBuilder('product')
      .where('product.name like :searchText', { searchText: `%${searchText}%` })
      .orWhere('product.description like :searchText', {
        searchText: `%${searchText}%`,
      })
      .take(PAGE_SIZE)
      .skip(offset)
      .getManyAndCount();

    const totalPages = Math.ceil(total / PAGE_SIZE);
    res.render('home', {
      product: products,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(
        page,
        totalPages,
        `searchText=${searchText}`,
      ),
    });
  } catch (err) {
    console.error(err);
    next();
  }
};

// [POST] rating and comment product
export const postRatingProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const { orderDetailId, productId, rating, comment } = req.body;
    const productReview = productReviewRepository.create({
      comment: comment,
      rating: parseInt(rating),
      user: user,
      product: { id: parseInt(productId) } 
    });
    await productReviewRepository.save(productReview);
    await orderDetailRepository.update(
      { id: parseInt(orderDetailId) },
      { reviewed: false },
    );
    return res.status(200).json({ message: req.t('user.ratingSuccessMessage') });
  } catch (error) {
    console.error(error);
    next();
  }
};

// [GET] comment in product
export const getRatingInProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = parseInt(req.body.productId);
    const product = await productRepository.findOne({
      where: { id: productId },
      relations: ['category', 'productImages', 'productReviews'],
    });
    if (!product) {
      req.flash('notfound', req.t('detail.notfound'));
      res.redirect('/');
    }
    return res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    next();
  }
};

// [GET] comment of user
export const getRatingProductOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);

    const [productReviews, totalItems] =
      await productReviewRepository.findAndCount({
        where: { user: { id: user.id } },
        relations: ['user', 'product'],
        take: PAGE_SIZE,
        skip: offset,
      });
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    res.render('order', {
      productReviews,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(page, totalPages),
    });
  } catch (error) {
    console.error(error);
    next();
  }
};
