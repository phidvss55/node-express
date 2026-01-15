import RequestWithUser from '@/modules/Authentication/interfaces/requestWithUser.interface';
import { DataStoredInToken } from '@/modules/Authentication/interfaces/token.interface';
import UserModel from '@/modules/UserModule/entities/user.entity';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import WrongAuthenticationTokenException from '../exceptions/wrong-token.exception';
import AuthenticationTokenMissingException from '../exceptions/missing-token.exception';

async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  const { headers } = request;
  if (headers.authorization) {
    const secret = process.env.JWT_SECRET ?? '';
    try {
      const token = headers.authorization.split(' ')[1];
      const verificationResponse = jwt.verify(token, secret) as unknown as DataStoredInToken;
      const id = verificationResponse._id;
      const user = await UserModel.findById(id);

      if (user) {
        request.user = user;
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      console.error(error);
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;
