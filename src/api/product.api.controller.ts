import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import {
  DEFAULT_PAGE,
  PAGE_SIZE,
  calculateOffset,
  priceValues,
  topLimitSelling,
} from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { checkLoggedIn } from '../utils/auth';
import { Category } from '../entities/Category';
import {
  createProductReview,
  getProductReviews,
  getProductReviewsOfProduct,
  getProductReviewsOfUser,
  getProductsWithSearchText,
} from '../service/product.service';
import { OrderDetail } from '../entities/OrderDetail';

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);

export const getProductDetail = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await productRepository.findOne({
      where: {
        id: productId,
        disable: false,
      },
      relations: ['category', 'productImages', 'productReviews'],
    });
    if (!product) {
      return res.status(404).json({ message: req.t('detail.notfound') });
    }

    const { countStar, averageRating, stars } = await getProductReviews(
      product.id,
    );

    res.status(200).json({ product, countStar, averageRating, stars });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getSearchProduct = async (req: Request, res: Response) => {
  try {
    const searchText = req.query.searchText;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const { category, products, totalPages } = await getProductsWithSearchText(
      searchText,
      page,
    );
    res
      .status(200)
      .json({ searchText, category, products, totalPages, currentPage: page });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const postRatingProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const { orderDetailId, productId, rating, comment } = req.body;
    await createProductReview(
      user.id,
      parseInt(productId),
      parseInt(rating),
      comment,
    );
    await orderDetailRepository.update(
      { id: parseInt(orderDetailId) },
      { reviewed: false },
    );
    res.status(200).json({ message: req.t('user.ratingSuccessMessage') });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getRatingInProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const productId = parseInt(req.query.productId as string);
    const rating = parseInt(req.query.rating as string);
    const page = parseInt(req.query.page as string) || 1;
    const { productReviews, totalPages } = await getProductReviewsOfProduct(
      productId,
      rating,
      page,
    );
    const paginationLinks = generatePaginationLinks(page, totalPages); // Khai báo generatePaginationLinks trong dự án của bạn
    res
      .status(200)
      .json({ productReviews, totalPages, currentPage: page, paginationLinks });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getRatingProductOfUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = await checkLoggedIn(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const { productReviews, totalPages } = await getProductReviewsOfUser(
      user.id,
      page,
    );
    res.status(200).json({ productReviews, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getHome = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page); // Khai báo calculateOffset trong dự án của bạn
    const [products, total] = await productRepository.findAndCount({
      where: {
        disable: false,
      },
      take: PAGE_SIZE,
      skip: offset,
    });
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const category = await categoryRepository.find();

    res.status(200).json({ category, products, totalPages, currentPage: page });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getSellingProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const topSelling = await productRepository.find({
      order: { numberSold: 'DESC' },
      take: topLimitSelling,
    });
    const category = await categoryRepository.find();
    res.status(200).json({ category, topSelling });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const multiSearch = async (
  req: Request,
  res: Response,
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
    res.status(200).json({ searchProducts });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
