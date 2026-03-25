import express from 'express';
import { addOrderItems, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToDelivered, getOrders } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();

router.post('/', authenticate, addOrderItems);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/pay', authenticate, updateOrderToPaid);
router.put('/:id/deliver', authenticate, updateOrderToDelivered);
router.get('/', authenticate, getOrders);

export default router;