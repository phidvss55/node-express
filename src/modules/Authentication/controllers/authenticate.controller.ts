import express, { Request, Response, NextFunction, Router } from 'express';
import LoginDto from '../validations/login.dto';
import UserAlreadyExistsException from '../exceptions/user-existed.exception';
import WrongCredentialsException from '../exceptions/wrong-credentials.exception';
import { comparePassword, createCookie, createToken } from '../utils/token';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { AuthenticationService } from '../services/authenticate.service';
import { asJson } from '@/core/common/utils';
import authMiddleware from '@/core/middlewares/auth.middleware';
import validationMiddleware from '@/core/middlewares/validation.middleware';
import IController from '@/factory/controller.interface';
import UserService from '@/modules/user-module/services/user.service';
import CreateUserDto from '@/modules/user-module/validations/create-user.dto';
import UserModel from '@/modules/user-module/entities/user.entity';

class AuthenticationController implements IController {
  public path = '/auth';
  public router: Router = express.Router();

  private readonly user = UserModel;

  private readonly userService: UserService;
  private readonly authenticationService: AuthenticationService;

  constructor(userService: UserService, authenService: AuthenticationService) {
    this.userService = userService;
    this.authenticationService = authenService;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.register);
    this.router.post(`${this.path}/login`, validationMiddleware(LoginDto), this.loggingIn);
    this.router.post(`${this.path}/logout`, this.loggingOut);
    this.router.post(`${this.path}/2fa/generate`, authMiddleware, this.generateTwoFactorAuthenticationCode);
  }

  public register = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    const checkUser = await this.userService.findUserByEmail(userData.email);

    if (checkUser) {
      next(new UserAlreadyExistsException(userData.email));
    } else {
      const user = await this.userService.createUser(userData);

      const tokenData = createToken(user);
      response.setHeader('Set-Cookie', [createCookie(tokenData)]);
      response.status(201).json(asJson(true, user));
    }
  };

  public loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const logInData: LoginDto = request.body;
    const user = await this.userService.findUserByEmail(logInData.email);
    if (user) {
      const isMatching = await comparePassword(logInData.password, user?.password || '');
      if (isMatching) {
        user.password = undefined;

        const tokenData = createToken(user);
        response.setHeader('Set-Cookie', [createCookie(tokenData)]);
        response.status(200).send(
          asJson(true, {
            user,
            token: tokenData,
          }),
        );
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  public loggingOut = (req: Request, res: Response) => {
    res.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    res.status(200).send(asJson(true, { token: null }));
  };

  public generateTwoFactorAuthenticationCode = async (request: RequestWithUser, response: Response) => {
    const user = request.user;
    const { otpauthUrl, base32 } = this.authenticationService.getTwoFactorAuthenticationCode();

    await this.user.findByIdAndUpdate(user?._id, {
      twoFactorAuthenticationCode: base32,
    });
    this.authenticationService.respondWithQRCode(otpauthUrl || '', response);
  };
}

export default AuthenticationController;
