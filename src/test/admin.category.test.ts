/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  changeCategoryStatus,
  createCategory,
  ListCategory,
  searchListCategory,
  updateCategory,
} from '../service/admin.category.service';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';
import { faker } from '@faker-js/faker';
import { DEFAULT_PAGE, PAGE_SIZE } from '../utils/constants';
const categoryRepository = AppDataSource.getRepository(Category);

let connection;

beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

// create category
describe('createCategory', () => {
  let name, description, newCategory;
  beforeEach(async () => {
    name = faker.commerce.department();
    description = faker.lorem.sentence();
    newCategory = await createCategory(name, description);
  });

  it('should create a new category', () => {
    expect(newCategory).toBeInstanceOf(Category);
  });

  it('should have correct name', () => {
    expect(newCategory.name).toBe(name);
  });

  it('should have correct description', () => {
    expect(newCategory.description).toBe(description);
  });
});

// update category
describe('updateCategory', () => {
  let id, name, description;

  beforeEach(() => {
    id = 1;
    name = faker.commerce.department();
    description = faker.lorem.sentence();
  });

  it('should check category', async () => {
    await updateCategory(id, name, description);
    const updatedCategory = await categoryRepository.findOne({ where: { id: id } });
    expect(updatedCategory).toBeTruthy();
  });

  it('should update category name', async () => {
    await updateCategory(id, name, description);
    const updatedCategory = await categoryRepository.findOne({ where: { id: id } });
    expect(updatedCategory!.name).toBe(name);
  });

  it('should update category description', async () => {
    await updateCategory(id, name, description);
    const updatedCategory = await categoryRepository.findOne({ where: { id: id } });
    expect(updatedCategory!.description).toBe(description);
  });
});

// active or inactive category
describe('changeCategoryStatus', () => {
  let id, disable;
  beforeEach(() => {
    id = 1;
    disable = faker.datatype.boolean();
  });

  it('should check category', async () => {
    await changeCategoryStatus(id, disable);
    const updatedCategory = await categoryRepository.findOne({ where: { id } });
    expect(updatedCategory).toBeTruthy();
  });

  it('should change category status', async () => {
    await changeCategoryStatus(id, disable);
    const updatedCategory = await categoryRepository.findOne({ where: { id } });
    expect(updatedCategory!.disable).toBe(disable);
  });
});


// get list category
describe('getListCategory', () => {
  let result;

  beforeEach(async () => {
    result = await ListCategory(DEFAULT_PAGE);
  });

  it('should return a list of categories', () => {
    expect(result).toHaveProperty('listCategory');
  });

  it('should return an array of categories', () => {
    expect(Array.isArray(result.listCategory)).toBe(true);
  });

  it('should not exceed PAGE_SIZE categories in the list', () => {
    expect(result.listCategory.length).toBeLessThanOrEqual(PAGE_SIZE);
  });

  it('should return total pages property', () => {
    expect(result).toHaveProperty('totalPages');
  });

  it('should return total pages as a number', () => {
    expect(typeof result.totalPages).toBe('number');
  });

  it('should ensure total pages is not negative', () => {
    expect(result.totalPages).toBeGreaterThanOrEqual(0);
  });

  it('should ensure total pages is an integer', () => {
    expect(result.totalPages % 1).toBe(0);
  });
});


// search category with text
describe('searchListCategory', () => {
  let text: string;
  let result: { listCategory: any[]; totalPages: number };

  beforeEach(async () => {
    text = faker.lorem.word();
    result = await searchListCategory(text, DEFAULT_PAGE);
  });

  it('should return a list of categories', () => {
    expect(result).toHaveProperty('listCategory');
  });

  it('should return total pages', () => {
    expect(result).toHaveProperty('totalPages');
  });

  it('should return an array of categories', () => {
    expect(Array.isArray(result.listCategory)).toBe(true);
  });

  it('should return total pages as a number', () => {
    expect(typeof result.totalPages).toBe('number');
  });

  it('should return a list of categories less than or equal to the page size', () => {
    expect(result.listCategory.length).toBeLessThanOrEqual(PAGE_SIZE);
  });

  it('should return total pages greater than or equal to 0', () => {
    expect(result.totalPages).toBeGreaterThanOrEqual(0);
  });

  it('should return total pages as an integer', () => {
    expect(result.totalPages % 1).toBe(0);
  });
  
  it('should return categories matching the search text', async () => {
    const text = faker.lorem.word();
    const result = await searchListCategory(text, DEFAULT_PAGE);

    for (const category of result.listCategory) {
      const nameContainsText = category.name.toLowerCase().includes(text.toLowerCase());
      const descriptionContainsText = category.description.toLowerCase().includes(text.toLowerCase());
      expect(nameContainsText || descriptionContainsText).toBeTruthy();
    }
  });
});
