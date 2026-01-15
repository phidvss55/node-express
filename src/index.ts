import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

import Application from './core/app';
import AuthenticationController from './modules/Authentication/controllers/authenticate.controller';
import AuthenticationService from './modules/Authentication/services/authenticate.service';
import ImagesController from './modules/ImageModule/controllers/images.controller';
import PostsController from './modules/PostModule/controllers/posts.controller';
import PostService from './modules/PostModule/services/posts.service';
import ReportController from './modules/ReportModule/controllers/report.controller';
import UserController from './modules/UserModule/controllers/user.controller';
import UserService from './modules/UserModule/services/user.service';
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
