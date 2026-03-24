import { Category } from '../models/Category.js';
import '../models/Product.js';


export const getCategories = async (req, res) => {
    const categories = await Category.find();
    res.status(200).json({
        success: true,
        data: categories,

    });
};

export const createCategory = async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json({
        success: true,
        data: category,
    });
};

export const updateCategory = async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
        success: true,
        data: category,
    });
};

export const deleteCategory = async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).json({
        success: true,
        data: null,
    });
};

export const getCategoryById = async (req, res) => {
    const category = await Category.findById(req.params.id).populate({
        path: 'products',
        options: { sort: { createdAt: -1 } },
    });
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({
        success: true,
        data: category,
    });
};