import { AppDataSource } from "../config/database";
import { getAdminOrderList, getOrderDetail, getOrderListByStatus } from "../service/admin.order.service";
import { DEFAULT_PAGE } from "../utils/constants";

let connection;

beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe('getOrderListByStatus', () => {
  let orderLists, totalPages;

  beforeEach(async () => {
    const status = 1;
    const result = await getOrderListByStatus(status, DEFAULT_PAGE);
    orderLists = result.orderLists;
    totalPages = result.totalPages;
  });

  it('should return order lists', () => {
    expect(orderLists).toBeDefined();
  });

  it('should return an array of order lists', () => {
    expect(Array.isArray(orderLists)).toBeTruthy();
  });

  it('should return total pages', () => {
    expect(totalPages).toBeDefined();
  });

  it('should return total pages as a number', () => {
    expect(typeof totalPages).toBe('number');
  });
});

describe('getOrderDetail', () => {
  let orderDetail, totalPages;

  beforeEach(async () => {
    const orderId = 1;
    const result = await getOrderDetail(orderId, DEFAULT_PAGE);
    orderDetail = result.orderDetail;
    totalPages = result.totalPages;
  });

  it('should return order detail', () => {
    expect(orderDetail).toBeDefined();
  });

  it('should return an array of order detail', () => {
    expect(Array.isArray(orderDetail)).toBeTruthy();
  });

  it('should return total pages', () => {
    expect(totalPages).toBeDefined();
  });

  it('should return total pages as a number', () => {
    expect(typeof totalPages).toBe('number');
  });
});

describe('getAdminOrderList', () => {
  let orderLists, totalPages;

  beforeEach(async () => {
    const result = await getAdminOrderList(DEFAULT_PAGE);
    orderLists = result.orderLists;
    totalPages = result.totalPages;
  });

  it('should return order lists', () => {
    expect(orderLists).toBeDefined();
  });

  it('should return an array of order lists', () => {
    expect(Array.isArray(orderLists)).toBeTruthy();
  });

  it('should return total pages', () => {
    expect(totalPages).toBeDefined();
  });

  it('should return total pages as a number', () => {
    expect(typeof totalPages).toBe('number');
  });
});
