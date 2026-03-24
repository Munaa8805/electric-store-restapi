import dotenv from 'dotenv';

dotenv.config();

function trim(s) {
  return typeof s === 'string' ? s.trim() : s;
}

const mongoUri = trim(process.env.MONGODB_URI) || trim(process.env.MONGO_URI);
if (!mongoUri) {
  throw new Error('MONGODB_URI or MONGO_URI is required');
}

const jwtSecretRaw = trim(process.env.JWT_SECRET)?.replace(/^["']|["']$/g, '') ?? '';
if (!jwtSecretRaw || jwtSecretRaw.length < 8) {
  throw new Error('JWT_SECRET is required and must be at least 8 characters');
}

export const env = {
  isProd: (trim(process.env.NODE_ENV) || 'development') === 'production',
  nodeEnv: trim(process.env.NODE_ENV) || 'development',
  port: Number(trim(process.env.PORT)) || 4000,
  mongoUri,
  corsOrigins: (trim(process.env.CORS_ORIGINS) || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  jwtSecret: jwtSecretRaw,
  jwtExpiresIn: trim(process.env.JWT_EXPIRES_IN) || trim(process.env.JWT_EXPIRE) || '7d',
};
