import { Request, Response, NextFunction } from 'express-serve-static-core';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';
import { DEFAULT_PAGE, PAGE_SIZE, calculateOffset, checkAdmin } from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';

const categoryRepository = AppDataSource.getRepository(Category);

// search category
export const searchCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const text = req.query.text;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    let filterCondition = '';
    filterCondition += `text=${text}&`;
    const [listCategory, totalUser] = await categoryRepository
      .createQueryBuilder('category')
      .where(
        'category.name LIKE :name OR category.description LIKE :description',
        {
          name: `%${text}%`,
          description: `%${text}%`,
        },
      )
      .skip(offset)
      .take(PAGE_SIZE)
      .getManyAndCount();

    const totalPages = Math.ceil(totalUser / PAGE_SIZE);
    res.render('admin/manageCategory', {
      listCategory,
      paginationItemsLinks: generatePaginationLinks(
        page,
        totalPages,
        filterCondition,
      ),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// list cate
export const getListCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkAdmin(req, res);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [listCategory, totalUser] = await categoryRepository.findAndCount({
      where:{
        disable: false
      },
      take: PAGE_SIZE,
      skip: offset,
      order: {
        disable: 'ASC',
        id: 'ASC'
      }
    });
    const totalPages = Math.ceil(totalUser / PAGE_SIZE);
    res.render('admin/manageCategory', {
      listCategory,
      paginationItemsLinks: generatePaginationLinks(page, totalPages),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// disable or active
export const postChangeStatusCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).json({ errors: errors.array() });
    }
    const id = +req.params.id;
    const { disable } = req.body;
    if (disable) {
      await categoryRepository.update({ id: id }, { disable: true });
    } else {
      await categoryRepository.update({ id: id }, { disable: false });
    }
    return res
      .status(200)
      .json({ message: 'Category status updated successfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// edit cate
export const putCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).json({ errors: errors.array() });
    }
    const { id, name, description } = req.body;
    await categoryRepository.update({ id }, { name, description });
    return res.status(200).json({ message: req.t('product.categoryUpdateSuccess') });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// create cate
export const postCreateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, description } = req.body;
    const newCate = await categoryRepository.create({ name, description });
    await categoryRepository.save(newCate);
    return res.status(200).json({ message: req.t('product.categoryCreateSuccess') });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postCreateValidation = [
  body('name')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('order.nameLength')),
  body('description')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage(() => i18next.t('order.nameLength'))
];
