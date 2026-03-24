import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productsRoutes from './routes/productsRoutes.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 6060;
connectDB();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/products', productsRoutes);

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