/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { ProductImage } from '../entities/ProductImage';
import { createProduct, getListProductForAdmin, saveSecondaryImages, searchProduct, updateMainProduct, updateProductStatus, updateSecondaryImages } from '../service/admin.product.service'; // Thay đường dẫn tương ứng
import { faker } from '@faker-js/faker';
import { DEFAULT_PAGE } from '../utils/constants';
const productImageRepository = AppDataSource.getRepository(ProductImage);
const productRepository = AppDataSource.getRepository(Product);
let connection;

beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe('getListProductForAdmin', () => {
  let page;
  let productListResult;

  beforeEach(async () => {
    page = 1;
    productListResult = await getListProductForAdmin(page);
  });
  it('should have productListResult property', () => {
    expect(productListResult).toBeDefined();
  });

  it('should have listProduct as an array', () => {
    expect(productListResult.listProduct).toBeInstanceOf(Array);
  });

  it('should have totalPages greater than 0', () => {
    expect(productListResult.totalPages).toBeGreaterThan(0);
  });
});

describe('createProduct', () => {
  let productData;
  let newProduct;

  beforeEach(async () => {
    productData = {
      name: faker.internet.userName(),
      description: faker.lorem.sentence(),
      price: 10,
      quantity: 100,
      unit: 'pcs',
      categoryId: 1,
      'primary-image': [{ path: './src/public/upload/image.jpg' }],
    };
    newProduct = await createProduct(productData);
  });
  it('should have newProduct property', () => {
    expect(newProduct).toBeDefined();
  });

  it('should have id property', () => {
    expect(newProduct).toHaveProperty('id');
  });

  it('should have correct name', () => {
    expect(newProduct.name).toBe(productData.name);
  });

  it('should have correct description', () => {
    expect(newProduct.description).toBe(productData.description);
  });

  it('should have correct price', () => {
    expect(newProduct.price).toBe(productData.price);
  });

  it('should have correct quantity', () => {
    expect(newProduct.quantity).toBe(productData.quantity);
  });

  it('should have correct unit', () => {
    expect(newProduct.unit).toBe(productData.unit);
  });

  it('should have correct category', () => {
    expect(newProduct.category.id).toBe(productData.categoryId);
  });

  it('should have correct image', () => {
    expect(newProduct.image).toBe('/upload/image.jpg');
  });
});

describe('saveSecondaryImages', () => {
  it('should save secondary images for the product', async () => {
    const product = { id: 1 };
    const images = [
      { path: '/upload/image1.jpg' },
      { path: '/upload/image2.jpg' },
    ];
    await saveSecondaryImages(product, images);

    const savedImages = await productImageRepository.find({ where: { product } });
    expect(savedImages.length).toBe(images.length);
  });

  it('should not save images if images array is empty', async () => {
    const product = { id: 1 };
    const images: any[] = [];
    await saveSecondaryImages(product, images);

    const savedImages = await productImageRepository.find({ where: { product } });
    expect(savedImages).toHaveLength(0);
  });
});

describe('updateMainProduct', () => {
  let id;
  let data;
  let updatedProduct;

  beforeEach(async () => {
    id = 1;
    data = {
      name: 'New Product Name',
      description: 'New Product Description',
      price: 50.99,
      quantity: 100,
      unit: 'pcs',
      categoryId: 1,
      'primary-image': [{ path: './src/public/upload/image.jpg' }],
    };

    await updateMainProduct(id, data);
    updatedProduct = await productRepository.findOne({
      where: { id: id }
    });
  });

  it('should have updatedProduct property', () => {
    expect(updatedProduct).toBeDefined();
  });

  it('should have correct name', () => {
    expect(updatedProduct.name).toBe(data.name);
  });

  it('should have correct description', () => {
    expect(updatedProduct.description).toBe(data.description);
  });

  it('should have correct price', () => {
    expect(updatedProduct.price).toBe(data.price);
  });

  it('should have correct quantity', () => {
    expect(updatedProduct.quantity).toBe(data.quantity);
  });

  it('should have correct unit', () => {
    expect(updatedProduct.unit).toBe(data.unit);
  });

  it('should have correct image', () => {
    expect(updatedProduct.image).toBe('/upload/image.jpg');
  });
});

describe('updateSecondaryImages', () => {
  it('should update secondary images for a product', async () => {
    const id = 1;
    const images = [
      { path: '/upload/image1.jpg' },
      { path: '/upload/image2.jpg' },
      { path: '/upload/image3.jpg' },
    ];

    await updateSecondaryImages(id, images);

    const updatedImages = await productImageRepository.find({ where: { product: { id: id } } });
    expect(updatedImages.length).toBe(images.length);
  });
});

describe('updateProductStatus', () => {
  let id, disable;
  beforeEach(() => {
    id = 1;
    disable = faker.datatype.boolean();
  });

  it('should check prodiuct', async () => {
    await updateProductStatus(id, disable);
    const updatedProduct = await productRepository.findOne({
      where: { id: id }
    });
    expect(updatedProduct).toBeTruthy();
  });

  it('should update product status', async () => {
    await updateProductStatus(id, disable);
    const updatedProduct = await productRepository.findOne({
      where: { id: id }
    });
    expect(updatedProduct.disable).toBe(disable);
  });
});

describe('searchProduct', () => {
  let searchText;
  let page;
  let searchResult;

  describe('when searching for products', () => {
    beforeEach(async () => {
      searchText =  faker.lorem.word();
      page = 1;
      searchResult = await searchProduct(searchText, page);
    });
    it('should have listProduct property', () => {
      expect(searchResult.listProduct).toBeDefined();
    });

    it('should have listProduct as an array', () => {
      expect(Array.isArray(searchResult.listProduct)).toBeTruthy();
    });

    it('should have totalPages property', () => {
      expect(searchResult.totalPages).toBeDefined();
    });

    it('should have totalPages greater than or equal to 0', () => {
      expect(searchResult.totalPages).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Searching for product check', () => {
  const text = faker.lorem.word();
  it('should have ptodfuct with name or description containing the search text', async () => {
    const result = await searchProduct(text, DEFAULT_PAGE);
    for (const product of result.listProduct) {
      const nameContainsText = product.name.toLowerCase().includes(text.toLowerCase());
      const descriptionContainsText = product.description.toLowerCase().includes(text.toLowerCase());
      expect(nameContainsText || descriptionContainsText).toBeTruthy();
    }
  });
});
