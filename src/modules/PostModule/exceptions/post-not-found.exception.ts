import HttpException from '../../../core/exceptions/http.exception';

class PostNotFoundException extends HttpException {
  constructor(id: string) {
    super(404, `Post with id ${id} not found`);
  }
}

export default PostNotFoundException;
