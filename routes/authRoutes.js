import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout } from '../controllers/authController.js';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts, try again later' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/logout', logout);

export default router;
