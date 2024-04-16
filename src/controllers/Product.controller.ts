/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { DEFAULT_PAGE, PAGE_SIZE, calculateOffset, priceValues, topLimitSelling } from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { checkLoggedIn } from '../utils/auth';
import { Category } from '../entities/Category';
import { createProductReview, getProductReviews, getProductReviewsOfProduct, getProductReviewsOfUser, getProductsWithSearchText } from '../service/product.service';
import { OrderDetail } from '../entities/OrderDetail';

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);
// GET product detail
export const getProductDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productRepository.findOne({
      where: {
        id: parseInt(req.params.id),
        disable: false
      },
      relations: ['category', 'productImages', 'productReviews'],
    });
    if (!product) {
      req.flash('notfound', req.t('detail.notfound'));
      res.redirect('/');
      return;
    }

    const { countStar, averageRating, stars } = await getProductReviews(product.id);

    res.render('detail', { product, countStar, averageRating, stars });
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
    const { category, products, totalPages } = await getProductsWithSearchText(searchText, page);
    res.render('home', {
      searchText,
      category,
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
    await createProductReview(user.id, parseInt(productId), parseInt(rating), comment);
    await orderDetailRepository.update(
      { id: parseInt(orderDetailId) },
      { reviewed: false },
    );
    return res
      .status(200)
      .json({ message: req.t('user.ratingSuccessMessage') });
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
    const productId = parseInt(req.query.productId as string);
    const rating = parseInt(req.query.rating as string);
    const page = parseInt(req.query.page as string) || 1;
    const { productReviews, totalPages} = await getProductReviewsOfProduct(productId, rating, page);
    const paginationLinks = generatePaginationLinks(page, totalPages);
    return res
      .status(200)
      .json({ productReviews, totalPages, currentPage: page, paginationLinks });
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
    const {productReviews, totalPages} = await getProductReviewsOfUser(user.id, page);
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

// get home
export const getHome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [products, total] = await productRepository.findAndCount({
      where:{
        disable: false
      },
      take: PAGE_SIZE,
      skip: offset,
    });
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const category = await categoryRepository.find();

    res.render('home', {
      category,
      product: products,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(page, totalPages),
      flash: {
        notfound: req.flash('notfound'),
        product_exist: req.flash('product_exist'),
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// [GET] top selling
export const getSellingProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const topSelling = await productRepository.find({
      order: { numberSold: 'DESC' },
      take: topLimitSelling,
    });
    const category = await categoryRepository.find();
    res.render('home', {
      category,
      topSelling,
    });
  } catch (error) {
    console.error(error);
    next();
  }
};

export const multiSearch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { priceRanges, categories } = req.body;
    const conditions = [];
    if (priceRanges && priceRanges.length > 0) {
      const priceConditions = priceRanges.map((range) => {
        return `(product.price >= ${priceValues[range].min} AND product.price <= ${priceValues[range].max})`;
      });
      conditions.push(priceConditions.join(' OR '));
    }

    if (categories && categories.length > 0) {
      const categoryConditions = categories.map((category) => {
        return `product.categoryId = ${category}`;
      });
      conditions.push(`(${categoryConditions.join(' OR ')})`); 
    }

    let query = productRepository.createQueryBuilder('product');

    if (conditions.length > 0) {
      query = query.where(conditions.join(' AND '));
    }
    const searchProducts = await query.getMany();
    res.json({ searchProducts });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
