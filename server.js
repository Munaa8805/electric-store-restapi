import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productsRoutes from './routes/productsRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 6060;

function isLocalhostOrigin(origin) {
    if (!origin) return true;
    try {
        const { hostname } = new URL(origin);
        return (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '[::1]' ||
            hostname === '::1'
        );
    } catch {
        return false;
    }
}

function normalizeOrigin(url) {
    if (!url) return '';
    return url.replace(/\/+$/, '');
}

/** Built-in production frontends (browser Origin has no path, e.g. https://electronic.munaa.dev) */
const corsBuiltInWhitelist = ['https://electronic.munaa.dev'];

const corsEnvOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => normalizeOrigin(s.trim()))
    .filter(Boolean);

const corsAllowedOrigins = new Set([
    ...corsBuiltInWhitelist.map(normalizeOrigin),
    ...corsEnvOrigins,
]);

connectDB();
app.use(helmet());
app.use(
    cors({
        origin(origin, callback) {
            if (isLocalhostOrigin(origin)) {
                callback(null, true);
                return;
            }
            if (origin && corsAllowedOrigins.has(normalizeOrigin(origin))) {
                callback(null, true);
                return;
            }
            callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/categories', categoriesRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Server error',
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

});

process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});