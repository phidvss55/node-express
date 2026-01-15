import express from 'express';
import bodyParser from 'body-parser';
import { connectionToDatabase } from '../database';
import IController from '../factory/controller.interface';
import errorMiddleware from './middlewares/error.middleware';
import cookieParser from 'cookie-parser';
import loggerMiddleware from './middlewares/logger';
import 'reflect-metadata';
import { envConfigs } from '@/configs/env';

export default class Application {
  public app: express.Application;
  public port: number;

  constructor(controllers: IController[], port: number) {
    this.app = express();
    this.port = port;

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(loggerMiddleware);
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: IController[]) {
    const { API_VERSION, API_BASE_PATH } = envConfigs;
    const prefix = `${API_VERSION}/${API_BASE_PATH}/`;

    controllers.forEach((controller) => {
      this.app.use(`/${prefix}`, controller.router);
    });

    this.addHealthCheckEndpoint();
  }

  private addHealthCheckEndpoint() {
    this.app.get('/health', (_req, res) => {
      res.status(200).send('OK');
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`================================`);
      console.log(`App listening on the port ${this.port}`);
      console.log(`================================`);
    });
  }

  private connectToTheDatabase() {
    connectionToDatabase();
  }
}
