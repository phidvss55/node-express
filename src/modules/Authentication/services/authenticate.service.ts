import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';
import UserModel from '../../UserModule/entities/user.entity';
import CreateUserDto from '../../UserModule/validations/create-user.dto';
import UserAlreadyExistsException from '../exceptions/user-existed.exception';
import { DataStoredInToken, TokenData } from '../interfaces/token.interface';
import User from '../../UserModule/interfaces/user.interface';
import { Response } from 'express';

class AuthenticationService {
  public user = UserModel;

  public async register(userData: CreateUserDto) {
    if (await this.user.findOne({ email: userData.email })) {
      throw new UserAlreadyExistsException(userData.email);
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.user.create({
      ...userData,
      password: hashedPassword,
    });
    const tokenData = this.createToken(user);
    const cookie = this.createCookie(tokenData);
    return {
      cookie,
      user,
    };
  }

  public createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  public createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
      email: user.email,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret || '', { expiresIn }),
    };
  }

  public getTwoFactorAuthenticationCode() {
    const secretCode = speakeasy.generateSecret({
      name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
    });
    return {
      otpauthUrl: secretCode.otpauth_url,
      base32: secretCode.base32,
    };
  }

  public respondWithQRCode(data: string, res: Response) {
    QRCode.toFileStream(res, data);
  }

  public verifyTwoFactorAuthenticationCode(twoFactorAuthenticationCode: string, user: User) {
    return speakeasy.totp.verify({
      secret: user.twoFactorAuthenticationCode || '',
      encoding: 'base32',
      token: twoFactorAuthenticationCode,
    });
  }
}

export default AuthenticationService;
