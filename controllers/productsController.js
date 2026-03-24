import { Product } from '../models/Product.js';

function parsePagination(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
    const page = Math.max(1, Number.parseInt(String(query.page), 10) || 1);
    const rawLimit = Number.parseInt(String(query.limit), 10) || defaultLimit;
    const limit = Math.min(maxLimit, Math.max(1, rawLimit));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

export const getProducts = async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};

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
    const filter = { isFeatured: true };

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
