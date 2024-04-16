import { AppDataSource } from "../config/database";
import { faker } from '@faker-js/faker';
import { createProductReview, getProductReviews, getProductReviewsOfProduct, getProductReviewsOfUser, getProductsWithSearchText } from "../service/product.service";
import { PAGE_SIZE } from "../utils/constants";

let connection;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe('getProductReviews', () => {
  let productId;
  let productReviews;

  beforeEach(async () => {
    productId = 1;
    productReviews = await getProductReviews(productId);
  });

  it('should have countStar property', () => {
    expect(productReviews.countStar).toBeDefined();
  });

  it('should have totalReviews property in countStar', () => {
    expect(productReviews.countStar).toHaveProperty('totalReviews');
  });

  it('should have oneStar property in countStar', () => {
    expect(productReviews.countStar).toHaveProperty('oneStar');
  });

  it('should have twoStar property in countStar', () => {
    expect(productReviews.countStar).toHaveProperty('twoStar');
  });

  it('should have threeStar property in countStar', () => {
    expect(productReviews.countStar).toHaveProperty('threeStar');
  });

  it('should have fourStar property in countStar', () => {
    expect(productReviews.countStar).toHaveProperty('fourStar');
  });

  it('should have fiveStar property in countStar', () => {
    expect(productReviews.countStar).toHaveProperty('fiveStar');
  });

  it('should have averageRating property', () => {
    expect(productReviews.averageRating).toBeDefined();
  });

  it('should have averageRating as a number', () => {
    expect(typeof productReviews.averageRating).toBe('number');
  });

  it('should have stars property', () => {
    expect(productReviews.stars).toBeDefined();
  });

  it('should have stars as an array', () => {
    expect(Array.isArray(productReviews.stars)).toBeTruthy();
  });

  it('should have 5 stars', () => {
    expect(productReviews.stars.length).toBe(5);
  });
});

describe('getProductsWithSearchText', () => {
  let searchText;
  let page;
  let productSearchResult;

  beforeEach(async () => {
    searchText = faker.lorem.word();
    page = 1;
    productSearchResult = await getProductsWithSearchText(searchText, page);
  });

  it('should have category property', () => {
    expect(productSearchResult.category).toBeDefined();
  });

  it('should have category as an array', () => {
    expect(Array.isArray(productSearchResult.category)).toBeTruthy();
  });

  it('should have products property', () => {
    expect(productSearchResult.products).toBeDefined();
  });

  it('should have products as an array', () => {
    expect(Array.isArray(productSearchResult.products)).toBeTruthy();
  });

  it('should have totalPages property', () => {
    expect(productSearchResult.totalPages).toBeDefined();
  });

  it('should have totalPages as a number', () => {
    expect(typeof productSearchResult.totalPages).toBe('number');
  });

  it('should have totalPages greater than or equal to 0', () => {
    expect(productSearchResult.totalPages).toBeGreaterThanOrEqual(0);
  });
});


describe('createProductReview', () => {
  let userId;
  let productId;
  let rating;
  let comment;
  let productReview;

  beforeEach(async () => {
    userId = 1;
    productId = 1;
    rating = 5;
    comment = 'Great product!';
    productReview = await createProductReview(userId, productId, rating, comment);
  });

  it('should have productReview property', () => {
    expect(productReview).toBeDefined();
  });

  it('should have correct rating', () => {
    expect(productReview.rating).toEqual(rating);
  });

  it('should have correct comment', () => {
    expect(productReview.comment).toEqual(comment);
  });
});


describe('getProductReviewsOfProduct', () => {
  let productId;
  let rating;
  let productReviewsResult;

  beforeEach(async () => {
    productId = 1;
    rating = 5;
    productReviewsResult = await getProductReviewsOfProduct(productId, rating, PAGE_SIZE);
  });
  it('should have totalPages property', () => {
    expect(productReviewsResult.totalPages).toBeGreaterThanOrEqual(0);
  });

  it('should have productReviews length less than or equal to PAGE_SIZE', () => {
    expect(productReviewsResult.productReviews.length).toBeLessThanOrEqual(PAGE_SIZE);
  });
});

describe('getProductReviewsOfUser', () => {
  let userId;
  let productReviewsResult;

  beforeEach(async () => {
    userId = 1;
    productReviewsResult = await getProductReviewsOfUser(userId, PAGE_SIZE);
  });
  it('should have totalPages property', () => {
    expect(productReviewsResult.totalPages).toBeGreaterThanOrEqual(0);
  });

  it('should have productReviews as an array', () => {
    expect(Array.isArray(productReviewsResult.productReviews)).toBeTruthy();
  });

  it('should have productReviews length less than or equal to PAGE_SIZE', () => {
    expect(productReviewsResult.productReviews.length).toBeLessThanOrEqual(PAGE_SIZE);
  });

  it('should have correct user information in each review', () => {
    productReviewsResult.productReviews.forEach((review) => {
      expect(review.user).toBeDefined();
      expect(review.user.id).toEqual(userId);
      expect(review.product).toBeDefined();
    });
  });
});
