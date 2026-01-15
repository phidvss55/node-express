import { cleanEnv, host, port, str } from 'envalid';

export function validateEnv(): void {
  cleanEnv(process.env, {
    // Application
    NODE_ENV: str({
      choices: ['development', 'production', 'test', 'staging'],
    }),
    PORT: port(),

    // API Configuration
    API_VERSION: str(),
    API_BASE_PATH: str(),

    // MongoDB
    MONGODB_HOST: host(),
    MONGODB_PORT: port(),
    MONGODB_DATABASE: str(),
    MONGODB_CONNECTION_STRING: str(),

    // RabbitMQ
    RABBITMQ_HOST: host(),
    RABBITMQ_PORT: port(),
    RABBITMQ_USER: str(),
    RABBITMQ_PASSWORD: str(),

    // Redis
    REDIS_HOST: host(),
    REDIS_PORT: port(),
    REDIS_PASSWORD: str(),

    // JWT
    JWT_SECRET_KEY: str(),
    JWT_EXPIRES_DAYS: str(),
  });
}

export const envConfigs = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'production', 'test', 'staging'],
  }),
  PORT: port(),
  API_VERSION: str(),
  API_BASE_PATH: str(),

  MONGODB_HOST: host(),
  MONGODB_PORT: port(),
  MONGODB_DATABASE: str(),
  MONGODB_CONNECTION_STRING: str(),

  RABBITMQ_HOST: host(),
  RABBITMQ_PORT: port(),
  RABBITMQ_USER: str(),
  RABBITMQ_PASSWORD: str(),

  REDIS_HOST: host(),
  REDIS_PORT: port(),
  REDIS_PASSWORD: str(),

  JWT_SECRET_KEY: str(),
  JWT_EXPIRES_DAYS: str(),
});
