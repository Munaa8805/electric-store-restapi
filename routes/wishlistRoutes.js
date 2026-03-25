import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, addToWishlist);
router.get('/add', authenticate, getWishlist);
router.delete('/remove/:productId', authenticate, removeFromWishlist);

export default router;