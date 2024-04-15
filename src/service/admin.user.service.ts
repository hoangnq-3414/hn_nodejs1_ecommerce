import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { PAGE_SIZE, ROLEUSER, calculateOffset } from '../utils/constants';

const userRepository = AppDataSource.getRepository(User);
export const getListUserForManage = async (page: number) => {
  const offset = calculateOffset(page);
  const [listUser, totalUser] = await userRepository
    .createQueryBuilder('user')
    .where('user.role = :role', { role: ROLEUSER })
    .orderBy({
      'user.disable': 'ASC',
      'user.id': 'ASC',
    })
    .skip(offset)
    .take(PAGE_SIZE)
    .getManyAndCount();

  const totalPages = Math.ceil(totalUser / PAGE_SIZE);
  return { listUser, totalPages };
};

export const changeUserStatus = async (userId: number, disable: boolean) => {
  await userRepository.update({ id: userId }, { disable: disable });
};

export const searchUserWithText = async (
  text: string,
  page: number,
) => {
  const offset = calculateOffset(page);
  const [listUser, totalUser] = await userRepository
    .createQueryBuilder('user')
    .where('user.email LIKE :email OR user.fullName LIKE :fullName', {
      email: `%${text}%`,
      fullName: `%${text}%`,
    })
    .skip(offset)
    .take(PAGE_SIZE)
    .getManyAndCount();

  const totalPages = Math.ceil(totalUser / PAGE_SIZE);
  return { listUser, totalPages };
};
