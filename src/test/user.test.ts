import { getUser, buildUpdateFields } from '../service/user.service';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { faker } from '@faker-js/faker';
import { changePassword } from '../service/user.service';

const userRepository = AppDataSource.getRepository(User);
let connection;

beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

// get user
describe('getUser', () => {
  it('should return the user with the specified userId', async () => {
    const userId = 1;
    const user = await getUser(userId);
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(userId);
  });

  it('should return null if the specified userId does not exist', async () => {
    const userId = 999;
    const user = await getUser(userId);
    expect(user).toBeNull();
  });
});

// update user
describe('buildUpdateFields', () => {
  it('should build update fields without image path', async () => {
    const user = new User;
    user.id = 1;
    const fullName = faker.internet.userName();
    const address = faker.location.streetAddress();
    const phone = faker.phone.number();
    const imagePath = '';

    const updateFields = await buildUpdateFields(user, address, fullName, phone, imagePath);

    expect(updateFields).toEqual({
      fullName,
      address,
      phone,
    });
  });

  it('should build update fields with image path', async () => {
    const user = new User;
    user.id = 1;
    const fullName = faker.internet.userName();
    const address = faker.location.streetAddress();
    const phone = faker.phone.number();
    const imagePath = '/path/to/image.jpg';

    const updateFields = await buildUpdateFields(user, address, fullName, phone, imagePath);

    expect(updateFields).toEqual({
      fullName,
      address,
      phone,
      image: imagePath,
    });
  });
});

// change pass
describe('changePassword', () => {
  it('should update password if the old password is correct', async () => {
    const user = await userRepository.findOne({
      where: { id: 18 }
    })
    const currentPassword = '123456';
    const newPassword = '123456';
    await expect(changePassword(user, currentPassword, newPassword)).resolves.not.toThrow();
  });

  it('should throw an error if the old password is incorrect', async () => {
    const user = await userRepository.findOne({
      where: { id: 8 }
    })
    const currentPassword = '1234567';
    const newPassword = 'newPassword';

    await expect(changePassword(user, currentPassword, newPassword)).rejects.toThrow('Old password is incorrect');

  });
});
