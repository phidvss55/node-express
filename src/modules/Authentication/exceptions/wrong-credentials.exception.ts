import HttpException from '../../../core/exceptions/http.exception';

class WrongCredentialsException extends HttpException {
  constructor() {
    super(401, 'Wrong credentials provided');
  }
}

export default WrongCredentialsException;
