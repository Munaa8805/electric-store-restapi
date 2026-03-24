import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { env } from './config/env.js';
import { apiV1Router } from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin:
      env.corsOrigins.length > 0
        ? env.corsOrigins
        : env.isProd
          ? false
          : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(compression());
app.use(
  express.json({
    limit: '100kb',
    strict: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(hpp());
app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Electronic Store API',
    entry: '/api/v1/health',
    auth: '/api/v1/auth/register | /api/v1/auth/login',
    profile: 'GET|PATCH /api/v1/users/me (Bearer token)',
  });
});

app.use('/api/v1', apiV1Router);

app.use(notFound);
app.use(errorHandler);

export { app };
