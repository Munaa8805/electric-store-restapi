import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

function formatZodIssues(error) {
  return error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));
}

export function validate({ body, query, params } = {}) {
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        next(new AppError(400, 'Validation failed', formatZodIssues(e)));
      } else {
        next(e);
      }
    }
  };
}
