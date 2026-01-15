import User from '@/modules/UserModule/interfaces/user.interface';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: User;
}

export default RequestWithUser;
