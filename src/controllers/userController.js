import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

function serializeUser(doc) {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    phone: doc.phone,
    address: doc.address,
    city: doc.city,
    state: doc.state,
    zip: doc.zip,
    country: doc.country,
    image: doc.image,
    isActive: doc.isActive,
    isVerified: doc.isVerified,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getMe(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError(404, 'User not found');
  res.json({ success: true, data: serializeUser(user.toObject()) });
}

export async function updateMe(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError(404, 'User not found');

  const allowed = [
    'name',
    'phone',
    'address',
    'city',
    'state',
    'zip',
    'country',
    'image',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  await user.save();

  res.json({ success: true, data: serializeUser(user.toObject()) });
}
