import { findUserByEmail, registerUser } from '../service/auth.service';
import { User } from '../entities/User';
import { Cart } from '../entities/Cart';
import { AppDataSource } from '../config/database';
import { faker } from '@faker-js/faker';

let connection;

beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe('registerUser', () => {
  let fullName: string;
  let email: string;
  let password: string;
  let result: { user: User; cart: Cart };

  beforeEach(async () => {
    fullName = faker.internet.userName();
    email = faker.internet.email();
    password = faker.internet.password();
    result = await registerUser(fullName, email, password);
  });

  it('should register a new user', () => {
    expect(result.user).toBeInstanceOf(User);
  });

  it('should create a cart for the new user', () => {
    expect(result.cart).toBeInstanceOf(Cart);
  });

  it('should throw an error if the user already exists', async () => {
    email = 'hoang@example.com';
    await expect(registerUser(fullName, email, password)).rejects.toThrow('User already exists');
  });
});

// service tim kiem email
describe('findUserByEmail', () => {
  it('should return user if email exists in the database', async () => {
    const userEmail = 'hoang.nq.13@gmail.com';
    const result = await findUserByEmail(userEmail);
    expect(result).toBeDefined();
    expect(result.email).toBe(userEmail);
  });

  it('should return null if email does not exist in the database', async () => {
    const userEmail = 'nonexistent@example.com';
    const result = await findUserByEmail(userEmail);
    expect(result).toBeNull();
  });
});
