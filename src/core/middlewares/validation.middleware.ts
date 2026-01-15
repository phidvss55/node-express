import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import HttpException from '../exceptions/http.exception';

function validationMiddleware<T>(type: any, skipMissingProperties = false): RequestHandler {
  return (req, _, next) => {
    validate(plainToClass(type, req.body), { skipMissingProperties }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => {
            return Object.values(error.constraints || {});
          })
          .join(', ');

        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
}

export default validationMiddleware;
