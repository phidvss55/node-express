export const asJson = (success = true, data: any = [], msg = 'Success', errors: any = null) => {
  return {
    success,
    msg,
    data,
    errors,
  };
};

export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  return fn(req, res, next).catch(next);
};

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  if (err.name === 'ValidationError') {
    err.status = 400;
  }
  next(err);
};
