import { hashPassword } from '../utils/auth';
import { User } from '../entities/User';
import { Cart } from '../entities/Cart';
import { AppDataSource } from '../config/database';
import { ROLEUSER } from '../utils/constants';
const userRepository = AppDataSource.getRepository(User);
const cartRepository = AppDataSource.getRepository(Cart);

export interface RegistrationResult {
  user: User;
  cart: Cart;
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
): Promise<RegistrationResult> {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  const newUser = userRepository.create({
    email,
    fullName,
    password: hashedPassword,
    role: ROLEUSER
  })
  await userRepository.save(newUser);

  const cart = cartRepository.create({
    user: newUser
  })
  await cartRepository.save(cart);

  return { user: newUser, cart: cart };
}

export const findUserByEmail = async (email: string) => {
  return await userRepository.findOne({
    where: { email: email },
  });
};
