/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";
import { ProductReview } from "../entities/ProductReview";
import { PAGE_SIZE, calculateOffset } from "../utils/constants";

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const productReviewRepository = AppDataSource.getRepository(ProductReview);
export const getProductReviews = async (productId: number) => {
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
    .where('product.id = :productId', { productId })
    .getRawOne();

  const averageRating = calculateAverageRating(countStar);

  const stars = [5, 4, 3, 2, 1];
  return { countStar, averageRating, stars };
};

const calculateAverageRating = (reviewCounts): number => {
  const totalReviews = + reviewCounts.totalReviews;
  const oneStar = + reviewCounts.oneStar;
  const twoStar = + reviewCounts.twoStar;
  const threeStar = + reviewCounts.threeStar;
  const fourStar = + reviewCounts.fourStar;
  const fiveStar = + reviewCounts.fiveStar;

  const totalStars =
    oneStar + twoStar * 2 + threeStar * 3 + fourStar * 4 + fiveStar * 5;
  const averageStars = totalStars / totalReviews;

  const averageRating = Math.round(averageStars * 10) / 10;

  return averageRating;
};

export const getProductsWithSearchText = async (searchText: any, page: number) => {
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
  return { category, products, totalPages };
};

export const createProductReview = async (userId: number, productId: number, rating: number, comment: string): Promise<ProductReview> => {
  const productReview = productReviewRepository.create({
    comment: comment,
    rating: rating,
    user: { id: userId },
    product: { id: productId },
  });
  await productReviewRepository.save(productReview);
  return productReview;
};

export const getProductReviewsOfProduct = async (productId: number, rating: any, page: any) => {
  const whereCondition: any = { product: { id: productId } };
  if (rating !== 0) {
    whereCondition.rating = rating;
  }
  const offset = calculateOffset(page);
  const [productReviews, totalItems] =
    await productReviewRepository.findAndCount({
      where: whereCondition,
      relations: ['user', 'product'],
      take: PAGE_SIZE,
      skip: offset,
    });

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return { productReviews, totalPages};
};

export const getProductReviewsOfUser = async (userId: number, page: number) => {
  const offset = calculateOffset(page);
  const [productReviews, totalItems] = await productReviewRepository.findAndCount({
    where: { user: { id: userId } },
    relations: ['user', 'product'],
    take: PAGE_SIZE,
    skip: offset,
  });
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  return { productReviews, totalPages};
};
