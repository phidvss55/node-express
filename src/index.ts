import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

import Application from './core/app';
import AuthenticationController from './modules/authentication/controllers/authenticate.controller';
import { AuthenticationService } from './modules/authentication/services/authenticate.service';
import ImagesController from './modules/image-module/controllers/images.controller';
import PostsController from './modules/post-module/controllers/posts.controller';
import PostService from './modules/post-module/services/posts.service';
import ReportController from './modules/report-module/controllers/report.controller';
import UserController from './modules/user-module/controllers/user.controller';
import UserService from './modules/user-module/services/user.service';
import { envConfigs, validateEnv } from './configs/env';

validateEnv();

const postService = new PostService();
const userService = new UserService();
const authenService = new AuthenticationService();

const app = new Application(
  [
    new AuthenticationController(userService, authenService),
    new PostsController(postService),
    new ImagesController(),
    new ReportController(),
    new UserController(postService),
  ],
  envConfigs.PORT,
);

app.listen();
