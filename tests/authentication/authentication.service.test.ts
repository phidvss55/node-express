import { AuthenticationService } from '@/modules/authentication/services/authenticate.service';
import UserAlreadyExistsException from '@/modules/authentication/exceptions/user-existed.exception';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import UserModel from '@/modules/user-module/entities/user.entity';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('speakeasy');
jest.mock('qrcode');

// Mock UserModel
jest.mock('@/modules/user-module/entities/user.entity', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    service = new AuthenticationService();
    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('should throw if user already exists', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue({ email: 'test@mail.com' });

      await expect(service.register({ email: 'test@mail.com', password: '123456' } as any)).rejects.toBeInstanceOf(
        UserAlreadyExistsException,
      );
    });

    it('should create user and return cookie + user', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const fakeUser = { _id: '1', email: 'test@mail.com' };
      (UserModel.create as jest.Mock).mockResolvedValue(fakeUser);

      jest.spyOn(service, 'createToken').mockReturnValue({
        token: 'jwt-token',
        expiresIn: 3600,
      });

      const result = await service.register({
        email: 'test@mail.com',
        password: '123456',
      } as any);

      expect(result.user).toEqual(fakeUser);
      expect(result.cookie).toContain('Authorization=jwt-token');
    });
  });

  describe('createToken()', () => {
    it('should return token data', () => {
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const token = service.createToken({
        _id: '1',
        email: 'test@mail.com',
      } as any);

      expect(token.token).toBe('signed-token');
      expect(token.expiresIn).toBe(3600);
    });
  });

  describe('getTwoFactorAuthenticationCode()', () => {
    it('should generate 2FA secret', () => {
      (speakeasy.generateSecret as jest.Mock).mockReturnValue({
        otpauth_url: 'otpauth://test',
        base32: 'BASE32SECRET',
      });

      const result = service.getTwoFactorAuthenticationCode();

      expect(result.base32).toBe('BASE32SECRET');
      expect(result.otpauthUrl).toBe('otpauth://test');
    });
  });

  describe('verifyTwoFactorAuthenticationCode()', () => {
    it('should verify 2FA code', () => {
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const isValid = service.verifyTwoFactorAuthenticationCode('123456', {
        twoFactorAuthenticationCode: 'BASE32',
      } as any);

      expect(isValid).toBe(true);
    });
  });

  describe('respondWithQRCode()', () => {
    it('should write QR code to response stream', () => {
      const res = {} as any;

      service.respondWithQRCode('qrcode-data', res);

      expect(QRCode.toFileStream).toHaveBeenCalledWith(res, 'qrcode-data');
    });
  });
});
