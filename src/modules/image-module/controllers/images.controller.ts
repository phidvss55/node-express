import IController from '@/factory/controller.interface';
import Post from '@/modules/post-module/interfaces/post.interface';
import express from 'express';

class ImagesController implements IController {
  public path = '/images';
  public router: express.Router = express.Router();

  private readonly posts: Post[] = [
    {
      authorId: 'Marcin',
      content: 'Dolor sit amet',
      title: 'Lorem Ipsum',
    },
  ];

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get('/posts', this.getAllPosts);
    this.router.post('/posts', this.createAPost);
  }

  getAllPosts = (request: express.Request, response: express.Response) => {
    response.send(this.posts);
  };

  createAPost = (request: express.Request, response: express.Response) => {
    const post: Post = request.body;
    this.posts.push(post);
    response.send(post);
  };
}

export default ImagesController;
