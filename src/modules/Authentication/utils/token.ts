import User from '../../user-module/interfaces/user.interface';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { DataStoredInToken, TokenData } from '../interfaces/token.interface';

export const createToken = (user: User): TokenData => {
  const expiresIn = 60 * 60;
  const secret = process.env.JWT_SECRET ?? '';
  const dataStoredInToken: DataStoredInToken = {
    _id: user._id,
    email: user.email,
  };

  return {
    expiresIn,
    token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
  };
};

export const createCookie = (tokenData: TokenData) => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
};

export const comparePassword = async (oldPass: string, newPass: string) => {
  return await bcrypt.compare(oldPass, newPass);
};
