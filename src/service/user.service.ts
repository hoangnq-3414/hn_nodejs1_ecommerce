/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { checkPassword, hashPassword } from '../utils/auth';
const userRepository = AppDataSource.getRepository(User);

export const getUser = async (userId: number): Promise<User> => {
  return await userRepository.findOne({
    where: { id: userId },
  });
};

export const buildUpdateFields = async (
  user: any,
  address: string,
  fullName: string,
  phone: string,
  imagePath: string,
) => {
  const updateFields: { [key: string]: any } = {
    fullName,
    address,
    phone,
  };
  if (imagePath !== '') {
    updateFields.image = imagePath;
  }
  await userRepository.update({ id: parseInt(user.id) }, updateFields);
  return updateFields;
};

export const changePassword = async (user: any, currentPassword: string, newPassword: string) => {
  const isMatch = await checkPassword(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Old password is incorrect');
  }
  const hashedPassword = await hashPassword(newPassword);
  await userRepository.update(
    { id: user.id },
    { password: hashedPassword },
  );
};
