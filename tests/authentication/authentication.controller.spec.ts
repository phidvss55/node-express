import { Request, Response, NextFunction } from 'express';
import AuthenticationController from '@/modules/authentication/controllers/authenticate.controller';
import { AuthenticationService } from '@/modules/authentication/services/authenticate.service';
import UserService from '@/modules/user-module/services/user.service';
import UserModel from '@/modules/user-module/entities/user.entity';
import CreateUserDto from '@/modules/user-module/validations/create-user.dto';
import LoginDto from '@/modules/authentication/validations/login.dto';
import UserAlreadyExistsException from '@/modules/authentication/exceptions/user-existed.exception';
import WrongCredentialsException from '@/modules/authentication/exceptions/wrong-credentials.exception';
import { createToken, createCookie, comparePassword } from '@/modules/authentication/utils/token';
import RequestWithUser from '@/modules/authentication/interfaces/requestWithUser.interface';

// Mock dependencies
jest.mock('@/modules/user-module/services/user.service');
jest.mock('@/modules/authentication/services/authenticate.service');
jest.mock('@/modules/user-module/entities/user.entity');
jest.mock('@/modules/authentication/utils/token');

describe('AuthenticationController', () => {
  let authController: AuthenticationController;
  let mockUserService: jest.Mocked<UserService>;
  let mockAuthService: jest.Mocked<AuthenticationService>;
  let mockRequest: Partial<RequestWithUser>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock services
    mockUserService = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
    } as any;

    mockAuthService = {
      getTwoFactorAuthenticationCode: jest.fn(),
      respondWithQRCode: jest.fn(),
    } as any;

    // Initialize controller
    authController = new AuthenticationController(mockUserService, mockAuthService);

    // Mock request and response
    mockRequest = {
      body: {},
      user: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('register', () => {
    const userData: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: '123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      };

      const mockTokenData = {
        token: 'mock-jwt-token',
        expiresIn: 3600,
      };

      const mockCookie = 'Authorization=mock-jwt-token; HttpOnly; Max-Age=3600';

      mockRequest.body = userData;
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(mockUser as any);
      (createToken as jest.Mock).mockReturnValue(mockTokenData);
      (createCookie as jest.Mock).mockReturnValue(mockCookie);

      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(createToken).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Set-Cookie', [mockCookie]);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser,
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyExistsException when user already exists', async () => {
      const existingUser = {
        _id: '123',
        email: userData.email,
      };

      mockRequest.body = userData;
      mockUserService.findUserByEmail.mockResolvedValue(existingUser as any);

      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserService.createUser).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(UserAlreadyExistsException));
    });
  });

  describe('loggingIn', () => {
    const loginData: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully with correct credentials', async () => {
      const mockUser = {
        _id: '123',
        email: loginData.email,
        password: 'hashedPassword',
        name: 'Test User',
      };

      const mockTokenData = {
        token: 'mock-jwt-token',
        expiresIn: 3600,
      };

      const mockCookie = 'Authorization=mock-jwt-token; HttpOnly; Max-Age=3600';

      mockRequest.body = loginData;
      mockUserService.findUserByEmail.mockResolvedValue(mockUser as any);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (createToken as jest.Mock).mockReturnValue(mockTokenData);
      (createCookie as jest.Mock).mockReturnValue(mockCookie);

      await authController.loggingIn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Set-Cookie', [mockCookie]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              _id: '123',
              email: loginData.email,
            }),
            token: mockTokenData,
          }),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw WrongCredentialsException when user not found', async () => {
      mockRequest.body = loginData;
      mockUserService.findUserByEmail.mockResolvedValue(null);

      await authController.loggingIn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockNext).toHaveBeenCalledWith(expect.any(WrongCredentialsException));
    });

    it('should throw WrongCredentialsException when password is incorrect', async () => {
      const mockUser = {
        _id: '123',
        email: loginData.email,
        password: 'hashedPassword',
      };

      mockRequest.body = loginData;
      mockUserService.findUserByEmail.mockResolvedValue(mockUser as any);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await authController.loggingIn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockNext).toHaveBeenCalledWith(expect.any(WrongCredentialsException));
    });
  });

  describe('loggingOut', () => {
    it('should logout user successfully', () => {
      authController.loggingOut(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Set-Cookie', ['Authorization=;Max-age=0']);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { token: null },
        }),
      );
    });
  });

  describe('generateTwoFactorAuthenticationCode', () => {
    it('should generate 2FA code and return QR code', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
      };

      const mock2FAData = {
        otpauthUrl: 'otpauth://totp/App:test@example.com?secret=BASE32SECRET',
        base32: 'BASE32SECRET',
      };

      const mockRequestWithUser = {
        ...mockRequest,
        user: mockUser,
      } as RequestWithUser;

      mockAuthService.getTwoFactorAuthenticationCode.mockReturnValue(mock2FAData);
      (UserModel.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(mockUser);

      await authController.generateTwoFactorAuthenticationCode(mockRequestWithUser, mockResponse as Response);

      expect(mockAuthService.getTwoFactorAuthenticationCode).toHaveBeenCalled();
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        twoFactorAuthenticationCode: mock2FAData.base32,
      });
      expect(mockAuthService.respondWithQRCode).toHaveBeenCalledWith(mock2FAData.otpauthUrl, mockResponse);
    });
  });

  describe('Router initialization', () => {
    it('should initialize routes correctly', () => {
      expect(authController.path).toBe('/auth');
      expect(authController.router).toBeDefined();
    });
  });
});
