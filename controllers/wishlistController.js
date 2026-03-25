import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
        } else {
            if (wishlist.products.includes(productId)) {
                return res.status(400).json({ success: false, message: 'Product already in wishlist' });
            }
            wishlist.products.push(productId);
            await wishlist.save();
        }
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


export const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;

    try {
        const wishlist = await Wishlist.findOneAndUpdate(
            { userId: req.user.id },
            { $pull: { products: productId } }, // Atomically removes the ID from the array
            { new: true } // Returns the updated document
        );

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        res.status(200).json({ message: "Product removed", wishlist });
    } catch (error) {
        res.status(500).json({ message: "Error removing from wishlist", error });
    }

};