import express, { Request, Response, NextFunction } from 'express';
import Post from '../interfaces/post.interface';
import PostService from '../services/posts.service';
import IController from '../../../factory/controller.interface';
import PostNotFoundException from '../exceptions/post-not-found.exception';
import CreatePostDto from '../validations/post.dto';
import authMiddleware from '@/core/middlewares/auth.middleware';
import validationMiddleware from '@/core/middlewares/validation.middleware';
import { asJson, asyncHandler } from '@/core/common/utils';
import RequestWithUser from '@/modules/Authentication/interfaces/requestWithUser.interface';

class PostsController implements IController {
  public path = '/posts';
  public router = express.Router();

  private readonly postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, asyncHandler(this.getAllPosts));
    this.router.get(`${this.path}/:id`, asyncHandler(this.getPostById));

    this.router
      .all(`${this.path}/*`, authMiddleware)
      .post(`${this.path}`, authMiddleware, validationMiddleware(CreatePostDto), this.createPost)
      .put(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.updatePostById)
      .delete(`${this.path}/:id`, this.removePostById);
  }

  getAllPosts = async (req: Request, res: Response) => {
    console.log('Getting all posts');
    const response = await this.postService.getAllPosts();
    res.status(200).send(asJson(true, response));
  };

  createPost = async (req: RequestWithUser, res: Response) => {
    const post: Post = req.body;
    const response = await this.postService.createPost(post, req.user?._id || null);
    res.status(201).send(asJson(true, response));
  };

  getPostById = async (request: Request, res: Response, next: NextFunction) => {
    const { id } = request.params;
    const _post = await this.postService.getPostById(id);
    if (_post) {
      res.status(200).send(asJson(true, _post));
    } else {
      next(new PostNotFoundException(id));
    }
  };

  updatePostById = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    const postData: Post = request.body;
    const res = await this.postService.updatePostById(id, postData);
    if (res) {
      response.status(200).send(res);
    } else {
      next(new PostNotFoundException(id));
    }
  };

  removePostById = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    const res = await this.postService.removePostById(id);

    response.status(200).send(res);
  };
}

export default PostsController;
