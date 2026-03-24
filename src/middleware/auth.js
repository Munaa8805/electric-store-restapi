import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'Authentication required'));
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
}
