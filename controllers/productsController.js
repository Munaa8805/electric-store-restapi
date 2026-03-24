import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

function parsePagination(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
    const page = Math.max(1, Number.parseInt(String(query.page), 10) || 1);
    const rawLimit = Number.parseInt(String(query.limit), 10) || defaultLimit;
    const limit = Math.min(maxLimit, Math.max(1, rawLimit));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

function firstQueryValue(value) {
    if (value === undefined || value === null) return '';
    const v = Array.isArray(value) ? value[0] : value;
    try {
        return decodeURIComponent(String(v)).trim();
    } catch {
        return String(v).trim();
    }
}

/**
 * Supports `?category=<id>` or `?categoryId=<id>` (Express may pass repeated keys as an array).
 * Casts to ObjectId so queries match `category` refs in MongoDB reliably.
 */
function applyCategoryFilter(query, filter) {
    const idStr =
        firstQueryValue(query.category) || firstQueryValue(query.categoryId);
    if (!idStr) {
        return { ok: true, filter };
    }
    if (!mongoose.isValidObjectId(idStr)) {
        return { ok: false, message: 'Invalid category id' };
    }
    return {
        ok: true,
        filter: { ...filter, category: new mongoose.Types.ObjectId(idStr) },
    };
}

export const getProducts = async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);

    const categoryResult = applyCategoryFilter(req.query, {});
    if (!categoryResult.ok) {
        return res.status(400).json({ success: false, message: categoryResult.message });
    }
    const filter = categoryResult.filter;

    const [total, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter).skip(skip).limit(limit).lean(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({
        success: true,
        data: products,
        meta: {
            total,
            page,
            limit,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1,
        },
    });
};

export const getProductsFeatured = async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);

    const categoryResult = applyCategoryFilter(req.query, { isFeatured: true });
    if (!categoryResult.ok) {
        return res.status(400).json({ success: false, message: categoryResult.message });
    }
    const filter = categoryResult.filter;

    const [total, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter).skip(skip).limit(limit).lean(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({
        success: true,
        data: products,
        meta: {
            total,
            page,
            limit,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1,
        },
    });
};


export const getProductsDiscounted = async (req, res) => {

    const filter = { discountPrice: { $ne: null } };
    const products = await Product.find(filter);
    res.status(200).json({
        success: true,
        data: products,
    });
};

export const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: product,
    });
};

export const createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        data: product,
    });
};

export const updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
        success: true,
        data: product,
    });
};

export const deleteProduct = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).json({
        success: true,
        data: null,
    });
};
