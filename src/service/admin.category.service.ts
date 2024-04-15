/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";
import { PAGE_SIZE, calculateOffset } from "../utils/constants";
const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (name: string, description: string) => {
  const newCate = await categoryRepository.create({ name, description });
  await categoryRepository.save(newCate);
  return newCate;
};

export const updateCategory = async (id: number, name: string, description: string) => {
  await categoryRepository.update({ id }, { name, description });
}

export const changeCategoryStatus = async (id: number, disable: boolean) => {
  await categoryRepository.update({ id }, { disable });
};

export const ListCategory = async (page: number) => {
  const offset = calculateOffset(page);
  const [listCategory, totalUser] = await categoryRepository.findAndCount({
    where: {
      disable: false,
    },
    take: PAGE_SIZE,
    skip: offset,
    order: {
      disable: 'ASC',
      id: 'ASC',
    },
  });
  const totalPages = Math.ceil(totalUser / PAGE_SIZE);
  return { listCategory, totalPages };
};

export const searchListCategory = async (text: any, page: number) => {
  const offset = calculateOffset(page);
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
  return { listCategory, totalPages };
};

