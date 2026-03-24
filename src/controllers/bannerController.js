import mongoose from 'mongoose';
import { Banner } from '../models/Banner.js';
import { AppError } from '../utils/AppError.js';

function serialize(doc) {
  return {
    id: doc._id,
    title: doc.title,
    subtitle: doc.subtitle,
    image: doc.image,
    cta: doc.cta,
    link: doc.link,
    color: doc.color,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listBanners(_req, res) {
  const items = await Banner.find().sort({ createdAt: 1 }).lean();
  res.json({ success: true, data: items.map(serialize) });
}

export async function getBanner(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid banner id');
  }
  const doc = await Banner.findById(req.params.id).lean();
  if (!doc) throw new AppError(404, 'Banner not found');
  res.json({ success: true, data: serialize(doc) });
}

export async function createBanner(req, res) {
  const created = await Banner.create({
    title: req.body.title,
    subtitle: req.body.subtitle,
    image: req.body.image,
    cta: req.body.cta,
    link: req.body.link,
    color: req.body.color,
  });
  res.status(201).json({ success: true, data: serialize(created.toObject()) });
}

export async function updateBanner(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid banner id');
  }
  const doc = await Banner.findById(req.params.id);
  if (!doc) throw new AppError(404, 'Banner not found');

  const fields = ['title', 'subtitle', 'image', 'cta', 'link', 'color'];
  for (const f of fields) {
    if (req.body[f] !== undefined) doc[f] = req.body[f];
  }
  await doc.save();

  res.json({ success: true, data: serialize(doc.toObject()) });
}

export async function deleteBanner(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid banner id');
  }
  const doc = await Banner.findById(req.params.id);
  if (!doc) throw new AppError(404, 'Banner not found');
  await doc.deleteOne();
  res.status(204).send();
}
