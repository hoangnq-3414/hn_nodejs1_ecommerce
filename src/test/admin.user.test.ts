/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker';
import { AppDataSource } from '../config/database';
import {
  changeUserStatus,
  getListUserForManage,
  searchUserWithText,
} from '../service/admin.user.service';
import { User } from '../entities/User';
const userRepository = AppDataSource.getRepository(User);
let connection;

beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe('getListUserForManage', () => {
  let page: number;
  let result: { listUser: any[]; totalPages: number };

  beforeEach(async () => {
    page = 1;
    result = await getListUserForManage(page);
  });

  it('should return a result', () => {
    expect(result).toBeDefined();
  });

  it('should return a list of users', () => {
    expect(result.listUser).toBeInstanceOf(Array);
  });

  it('should return the total pages', () => {
    expect(result.totalPages).toBeGreaterThan(0);
  });
});

describe('changeUserStatus', () => {
  let id: number;
  let disable: boolean;
  let updatedUser: any;

  beforeEach(async () => {
    id = 1;
    disable = faker.datatype.boolean();
    await changeUserStatus(id, disable);
    updatedUser = await userRepository.findOne({ where: { id } });
  });

  it('should update the user', () => {
    expect(updatedUser).toBeTruthy();
  });

  it('should change the user status', () => {
    expect(updatedUser!.disable).toBe(disable);
  });
});

describe('searchUser', () => {
  let searchText: string;
  let page: number;
  let result: { listUser: any[]; totalPages: number };

  beforeEach(async () => {
    searchText = 'hoang';
    page = 1;
    result = await searchUserWithText(searchText, page);
  });

  it('should return a list of users', () => {
    expect(result.listUser).toHaveLength(4);
  });

  it('should return the correct total pages', () => {
    expect(result.totalPages).toBe(1);
  });

  it('should return users matching the search text in email or fullName', () => {
    for (const user of result.listUser) {
      const emailContainsText = user.email.toLowerCase().includes(searchText.toLowerCase());
      const fullNameContainsText = user.fullName.toLowerCase().includes(searchText.toLowerCase());
      expect(emailContainsText || fullNameContainsText).toBeTruthy();
    }
  });
});
