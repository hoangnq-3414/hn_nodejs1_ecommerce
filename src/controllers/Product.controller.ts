/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { DEFAULT_PAGE, PAGE_SIZE, calculateOffset, priceValues, topLimitSelling } from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { ProductReview } from '../entities/ProductReview';
import { OrderDetail } from '../entities/OrderDetail';
import { checkLoggedIn } from '../utils/auth';
import { Category } from '../entities/Category';

const productRepository = AppDataSource.getRepository(Product);
const productReviewRepository = AppDataSource.getRepository(ProductReview);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);
const categoryRepository = AppDataSource.getRepository(Category);

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

    const countStar = await productReviewRepository
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'totalReviews')
      .addSelect(
        'COALESCE(SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END), 0)',
        'oneStar',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END), 0)',
        'twoStar',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END), 0)',
        'threeStar',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END), 0)',
        'fourStar',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END), 0)',
        'fiveStar',
      )
      .innerJoin('review.product', 'product')
      .where('product.id = :productId', { productId: parseInt(req.params.id) })
      .getRawOne();

    const averageRating = calculateAverageRating(countStar);

    const stars = [5, 4, 3, 2, 1] ;

    res.render('detail', { product, countStar, averageRating, stars });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const calculateAverageRating = (reviewCounts): number => {
  const totalReviews =+ reviewCounts.totalReviews;
  const oneStar =+ reviewCounts.oneStar;
  const twoStar =+ reviewCounts.twoStar;
  const threeStar =+ reviewCounts.threeStar;
  const fourStar =+ reviewCounts.fourStar;
  const fiveStar =+ reviewCounts.fiveStar;

  const totalStars =
    oneStar + twoStar * 2 + threeStar * 3 + fourStar * 4 + fiveStar * 5;
  const averageStars = totalStars / totalReviews;

  const averageRating = Math.round(averageStars * 10) / 10;

  return averageRating;
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
    const category = await categoryRepository.find();
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
    const productReview = productReviewRepository.create({
      comment: comment,
      rating: parseInt(rating),
      user: user,
      product: { id: parseInt(productId) },
    });
    await productReviewRepository.save(productReview);
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
    const whereCondition: any = { product: { id: productId } };

    const rating = parseInt(req.query.rating as string);
    if (rating !== 0) {
      whereCondition.rating = rating;
    }

    const page = parseInt(req.query.page as string) || 1;
    const offset = calculateOffset(page);

    const [productReviews, totalItems] =
      await productReviewRepository.findAndCount({
        where: whereCondition,
        relations: ['user', 'product'],
        take: PAGE_SIZE,
        skip: offset,
      });

    const totalPages = Math.ceil(totalItems / PAGE_SIZE); // Tính tổng số trang
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
