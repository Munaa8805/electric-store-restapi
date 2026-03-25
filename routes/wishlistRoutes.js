import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authenticate, addToWishlist);
router.delete('/remove', authenticate, removeFromWishlist);
router.get('/', authenticate, getWishlist);


export default router;