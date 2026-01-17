import express, { NextFunction, Response, Router } from 'express';
import NotAuthorizedException from '@/core/exceptions/not-authorized.exception';
import IController from '@/factory/controller.interface';
import authMiddleware from '@/core/middlewares/auth.middleware';
import PostService from '@/modules/post-module/services/posts.service';
import RequestWithUser from '@/modules/authentication/interfaces/requestWithUser.interface';

class UserController implements IController {
  public path: string = '/users';
  public router: Router = express.Router();
  public postService: PostService;

  constructor(postService: PostService) {
    this.initializeRoutes();
    this.postService = postService;
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
  }

  private readonly getAllPostsOfUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    if (userId === req?.user?._id.toString()) {
      const posts = await this.postService.findByCondition({
        author: userId,
      });
      res.send(posts);
    }
    next(new NotAuthorizedException());
  };
}

export default UserController;
