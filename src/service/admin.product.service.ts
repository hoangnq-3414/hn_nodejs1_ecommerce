/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { PAGE_SIZE, calculateOffset } from "../utils/constants";
import { ProductImage } from "../entities/ProductImage";

const productRepository = AppDataSource.getRepository(Product);
const productImageRepository = AppDataSource.getRepository(ProductImage);

// service list product
export const getListProductForAdmin = async (page: number) => {
  const offset = calculateOffset(page);
  const [listProduct, totalProduct] = await productRepository.findAndCount({
    relations: ['category'],
    take: PAGE_SIZE,
    skip: offset,
    order: {
      disable: 'ASC',
      id: 'ASC',
    },
  });
  const totalPages = Math.ceil(totalProduct / PAGE_SIZE);
  return { listProduct, totalPages };
};

// Tạo hàm tạo mới sản phẩm
export const createProduct = async (data: any) => {
  const { name, description, price, quantity, unit, categoryId } = data;
  let primaryImgPath = '';
  const primaryImage = data['primary-image'];
  if (primaryImage && primaryImage.length > 0) {
    const primaryImgFile = primaryImage[0];
    if (primaryImgFile && primaryImgFile.path) {
      const uploadDir = path.resolve(__dirname, '../public/upload');
      const relativePath = path.relative(uploadDir, primaryImgFile.path);
      primaryImgPath = '/upload/' + relativePath;
    }
  }

  const newProduct = await productRepository.create({
    name,
    description,
    price,
    quantity,
    unit,
    category: { id: categoryId },
    numberSold: 0,
    image: primaryImgPath,
  });

  await productRepository.save(newProduct);
  return newProduct;
};

// Tạo hàm lưu hình ảnh sản phẩm phụ
export const saveSecondaryImages = async (product: any, images: any[]) => {
  await productImageRepository.delete({ product: { id: product.id } })
  if (Array.isArray(images)) {
    await Promise.all(
      images.map(async (image) => {
        const uploadDir = path.resolve(__dirname, '../public/upload');
        const relativePath = path.relative(uploadDir, image.path);
        const imagePath = '/upload/' + relativePath;
        const productImage = new ProductImage();
        productImage.image = imagePath;
        productImage.product = product;

        await productImageRepository.save(productImage);
      }),
    );
  }
};

// Cap nhat san pham
export const updateMainProduct = async (id: number, data: any) => {
  const { name, description, price, quantity, unit, categoryId } = data;
  let primaryImgPath = '';
  const primaryImage = data['primary-image'];
  if (primaryImage && primaryImage.length > 0) {
    const primaryImgFile = primaryImage[0];
    if (primaryImgFile && primaryImgFile.path) {
      const uploadDir = path.resolve(__dirname, '../public/upload');
      const relativePath = path.relative(uploadDir, primaryImgFile.path);
      primaryImgPath = '/upload/' + relativePath;
    }
  }

  await productRepository.update(
    { id: id },
    {
      name,
      description,
      price,
      quantity,
      unit,
      category: { id: categoryId },
      numberSold: 0,
      image: primaryImgPath,
    },
  );
};

// update image 
export const updateSecondaryImages = async (id: number, images: any[]) => {
  const product = await productRepository.findOne({
    where:{id: id}
  });
  await productImageRepository.delete({ product: { id: id } });
  if (Array.isArray(images)) {
    await Promise.all(
      images.map(async (image) => {
        const uploadDir = path.resolve(__dirname, '../public/upload');
        const relativePath = path.relative(uploadDir, image.path);
        const imagePath = '/upload/' + relativePath;

        const productImage = productImageRepository.create({
          image: imagePath,
          product: product,
        });
        await productImageRepository.save(productImage);
      }),
    );
  }
};

export const updateProductStatus = async (id: number, disable: boolean) => {
  await productRepository.update({ id: id }, { disable: disable });
};

export const searchProduct = async (text: any, page: number) => {
  const offset = calculateOffset(page);
  const [listProduct, total] = await productRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category')
    .where(
      'product.name LIKE :name OR product.description LIKE :description',
      {
        name: `%${text}%`,
        description: `%${text}%`,
      },
    )
    .take(PAGE_SIZE)
    .skip(offset)
    .getManyAndCount();

  const totalPages = Math.ceil(total / PAGE_SIZE);
  return { listProduct, totalPages };
};
