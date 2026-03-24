import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken({ userId, role }) {
  return jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}
