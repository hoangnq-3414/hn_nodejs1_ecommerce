import { AppDataSource } from "../config/database";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { getCartItems, getCartItemsWhenOrder, getOrderListsByStatus, getUserOrderLists, updateOrderStatusAndSendEmail, } from "../service/order.service";
import { DEFAULT_PAGE, OrderStatus, } from "../utils/constants";

let connection;

beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe('getCartItemsWhenOrder', () => {
  let cartItems, total, items, totalPages;

  beforeEach(async () => {
    const cartId = 18;
    const result = await getCartItemsWhenOrder(cartId, DEFAULT_PAGE);
    cartItems = result.cartItems;
    total = result.total;
    items = result.items;
    totalPages = result.totalPages;
  });

  it('should return cart items', () => {
    expect(cartItems).toBeDefined();
  });

  it('should return an array of cart items', () => {
    expect(Array.isArray(cartItems)).toBeTruthy();
  });

  it('should return total', () => {
    expect(total).toBeDefined();
  });

  it('should return total as a number', () => {
    expect(typeof total).toBe('number');
  });

  it('should return items', () => {
    expect(items).toBeDefined();
  });

  it('should return items as a string', () => {
    expect(typeof items).toBe('string');
  });

  it('should return total pages', () => {
    expect(totalPages).toBeDefined();
  });

  it('should return total pages as a number', () => {
    expect(typeof totalPages).toBe('number');
  });
});

describe('getCartItems', () => {
  let cartItems;

  beforeEach(async () => {
    const cart = new Cart();
    cart.id = 18;
    cartItems = await getCartItems(cart);
  });

  it('should return cart items', () => {
    expect(cartItems).toBeDefined();
  });

  it('should return an array of cart items', () => {
    expect(Array.isArray(cartItems)).toBeTruthy();
  });
});

describe('getOrderListsByStatus', () => {
  let orderLists, totalPages;

  beforeEach(async () => {
    const user = new User();
    user.id = 1;
    const status = 1;
    const result = await getOrderListsByStatus(user, status, DEFAULT_PAGE);
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


describe('getUserOrderLists', () => {
  let orderLists, totalPages;

  beforeEach(async () => {
    const user = new User();
    user.id = 1;
    const result = await getUserOrderLists(user, DEFAULT_PAGE);
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

describe('updateOrderStatusAndSendEmail', () => {
  it('should update order status and send email for rejected status', async () => {
    const orderId = 1;
    const status = OrderStatus.Rejected;
    const rejectReason = 'Out of stock';
    const email = 'hoang.nq.13@gmail.com.com';

    await expect(updateOrderStatusAndSendEmail(orderId, status, rejectReason, email)).resolves.not.toThrow();
  });

  it('should update order status and send email for successful status', async () => {
    const orderId = 1;
    const status = OrderStatus.Successful;
    const email = 'hoang.nq.13@gmail.com.com';
   
    await expect(updateOrderStatusAndSendEmail(orderId, status, '', email)).resolves.not.toThrow();
  });
});
