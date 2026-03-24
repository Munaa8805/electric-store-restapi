import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

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

app.use(
  express.static(publicDir, {
    index: 'index.html',
    maxAge: env.isProd ? '1d' : 0,
  })
);

app.use('/api/v1', apiV1Router);

app.use(notFound);
app.use(errorHandler);

export { app };
