import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { DEFAULT_PAGE, PAGE_SIZE, calculateOffset } from '../utils/constants';
import { generatePaginationLinks } from '../utils/pagenation';

const productRepository = AppDataSource.getRepository(Product);

// GET product detail
export const getProductDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['category', 'productImages'],
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
export const getSearchProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchText = req.query.searchText;
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const offset = calculateOffset(page);
    const [products, total] = await productRepository
      .createQueryBuilder('product')
      .where('product.name like :searchText',{ searchText: `%${searchText}%` })
      .orWhere('product.description like :searchText',{ searchText: `%${searchText}%` })
      .take(PAGE_SIZE)
      .skip(offset)
      .getManyAndCount()

    const totalPages = Math.ceil(total / PAGE_SIZE);
    res.render('home', {
      product: products,
      totalPages: totalPages,
      currentPage: page,
      paginationLinks: generatePaginationLinks(page, totalPages, `searchText=${searchText}`),
    });

  } catch (err) {
    console.error(err);
    next()
  }
}
