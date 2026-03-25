import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';


export const addOrderItems = async (req, res, next) => {

    try {
        const { items, shippingAddress, paymentMethod, paymentResult, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Items are required' });
        }
        if (!shippingAddress || typeof shippingAddress !== 'object' || !Object.keys(shippingAddress).length) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }
        if (!['card', 'cash', 'bank_transfer'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Payment method is required' });
        }
        if (!paymentResult || typeof paymentResult !== 'object' || !Object.keys(paymentResult).length) {
            return res.status(400).json({ success: false, message: 'Payment result is required' });
        }
        if (!itemsPrice || typeof itemsPrice !== 'number') {
            return res.status(400).json({ success: false, message: 'Items price is required' });
        }
        if (!taxPrice || typeof taxPrice !== 'number') {
            return res.status(400).json({ success: false, message: 'Tax price is required' });
        }

        if (!totalPrice || typeof totalPrice !== 'number') {
            return res.status(400).json({ success: false, message: 'Total price is required' });
        }
        const order = await Order.create({
            user: req.user.id,
            orderItems: items,
            shippingAddress,
            paymentMethod,
            paymentResult,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json({ success: true, data: orders });
};


export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
};


export const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);
    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();
    res.status(200).json({ success: true, data: order });
};

export const updateOrderToDelivered = async (req, res) => {
    const order = await Order.findById(req.params.id);
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
    res.status(200).json({ success: true, data: order });
};

export const getOrders = async (req, res) => {
    const orders = await Order.find().populate('user', 'id name');
    res.status(200).json({ success: true, data: orders });
};

