import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { DEFAULT_PAGE, PAGE_SIZE, calculateOffset } from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { Category } from '../entities/Category';
import multer from 'multer';
import path from 'path';
import { ProductImage } from '../entities/ProductImage';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const productImageRepository = AppDataSource.getRepository(ProductImage);

// Get list product
export const getListProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //   const user = await checkLoggedIn(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
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
    if (disable) {
      await productRepository.update({ id: id }, { disable: true });
    } else {
      await productRepository.update({ id: id }, { disable: false });
    }
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
    const offset = calculateOffset(page);
    let filterCondition = '';
    filterCondition += `text=${text}&`;
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

// vo hieu hoa hoac kich hoat san pham
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
    const { name, description, price, quantity, unit, categoryId } = req.body;
    let primaryImgPath = '';
    const primaryImage = req.files['primary-image'];
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

    const secondaryImages = req.files['images-second'];
    if (Array.isArray(secondaryImages)) {
      await Promise.all(
        secondaryImages.map(async (image) => {
          const uploadDir = path.resolve(__dirname, '../public/upload');
          const relativePath = path.relative(uploadDir, image.path);
          const imagePath = '/upload/' + relativePath;

          const productImage = new ProductImage();
          productImage.image = imagePath;
          productImage.product = newProduct;

          await productImageRepository.save(productImage);
        }),
      );
    }
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
    const { id, name, description, price, quantity, unit, categoryId } =
      req.body;
    let primaryImgPath = '';
    const primaryImage = req.files['primary-image'];
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

    const secondaryImages = req.files['images-second'];
    if (Array.isArray(secondaryImages)) {
      await Promise.all(
        secondaryImages.map(async (image) => {
          const uploadDir = path.resolve(__dirname, '../public/upload');
          const relativePath = path.relative(uploadDir, image.path);
          const imagePath = '/upload/' + relativePath;
          await productImageRepository.update({ id: id }, { image: imagePath });
        }),
      );
    }
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
