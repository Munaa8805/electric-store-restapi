import express from 'express';
import { toggleToWishlist, getWishlist } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/toggle', authenticate, toggleToWishlist);
router.get('/', authenticate, getWishlist);


export default router;