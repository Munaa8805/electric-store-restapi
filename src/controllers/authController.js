import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/token.js';



export async function register(req, res) {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new AppError(409, 'Email already registered');

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: 'user',
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  const userData = user.password ? "********" : "***";
  res.status(201).json({
    success: true,
    data: {
      user: userData,
      token,
    },
  });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user) throw new AppError(401, 'Invalid email or password');

  const ok = await user.comparePassword(req.body.password);
  if (!ok) throw new AppError(401, 'Invalid email or password');

  if (!user.isActive) throw new AppError(403, 'Account is disabled');

  const token = signToken({ userId: user._id.toString(), role: user.role });
  const safe = user.toObject();
  delete safe.password;

  res.json({
    success: true,
    data: {
      user: serializeUser(safe),
      token,
    },
  });
}
