import bcrypt from 'bcrypt';
const jwtSecret = process.env.JWT_SECRET;
import jwt from 'jsonwebtoken';

// Method to check password
export const checkPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Method to generate token
export const generateToken = async (userId: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign({ user: { id: userId } }, jwtSecret, { expiresIn: 86400 }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const decodeJWT = async (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};
