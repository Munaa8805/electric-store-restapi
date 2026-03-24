import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

function serialize(doc) {
  return {
    id: doc._id,
    name: doc.name,
    icon: doc.icon,
    image: doc.image,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listCategories(_req, res) {
  const items = await Category.find().sort({ name: 1 }).lean();
  res.json({ success: true, data: items.map(serialize) });
}

export async function getCategory(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid category id');
  }
  const doc = await Category.findById(req.params.id).lean();
  if (!doc) throw new AppError(404, 'Category not found');
  res.json({ success: true, data: serialize(doc) });
}

export async function createCategory(req, res) {
  const created = await Category.create({
    name: req.body.name,
    icon: req.body.icon,
    image: req.body.image,
  });
  res.status(201).json({ success: true, data: serialize(created.toObject()) });
}

export async function updateCategory(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid category id');
  }
  const doc = await Category.findById(req.params.id);
  if (!doc) throw new AppError(404, 'Category not found');

  if (req.body.name !== undefined) doc.name = req.body.name;
  if (req.body.icon !== undefined) doc.icon = req.body.icon;
  if (req.body.image !== undefined) doc.image = req.body.image;
  await doc.save();

  res.json({ success: true, data: serialize(doc.toObject()) });
}

export async function deleteCategory(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid category id');
  }
  const doc = await Category.findById(req.params.id);
  if (!doc) throw new AppError(404, 'Category not found');
  const inUse = await Product.countDocuments({ category: doc._id });
  if (inUse > 0) {
    throw new AppError(409, 'Cannot delete category that has products');
  }
  await doc.deleteOne();
  res.status(204).send();
}
