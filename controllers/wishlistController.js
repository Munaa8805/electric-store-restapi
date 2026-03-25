import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';

export const toggleToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
        } else {
            if (wishlist.products.includes(productId)) {
                wishlist.products = wishlist.products.filter(product => product.toString() !== productId);
            } else {
                wishlist.products.push(productId);
            }
            await wishlist.save();
        }
        await wishlist.populate('products');
        res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };
};

export const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({ user: req.user.id }).populate('products').lean();
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found', products: [] });
        }

        res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };
};
