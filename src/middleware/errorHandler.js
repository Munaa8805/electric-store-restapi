import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

function isAppError(err) {
  return err instanceof AppError;
}

export function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details;

  if (isAppError(err)) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path ?? 'id'}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key';
    details = err.keyValue;
  }

  if (statusCode >= 500 && !env.isProd) {
    console.error(err);
  } else if (statusCode >= 500) {
    console.error(err.message);
  }

  const body = { success: false, message };
  if (details !== undefined) body.details = details;
  if (!env.isProd && statusCode >= 500 && err.stack) body.stack = err.stack.split('\n').slice(0, 8);

  res.status(statusCode).json(body);
}
