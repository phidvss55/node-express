import UserModel from '../entities/user.entity';
import User from '../interfaces/user.interface';
import CreateUserDto from '../validations/create-user.dto';
import * as bcrypt from 'bcryptjs';

class UserService {
  async createUser(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user: any = await UserModel.create({
      ...data,
      password: hashedPassword,
      name: [data.firstName, data.lastName].join(' '),
    });

    const _user = user.toObject();
    delete _user.password;
    return _user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await UserModel.findOne({ email }).exec();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}

export default UserService;
