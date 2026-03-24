import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

function jwtSecret() {
    const secret = process.env.JWT_SECRET?.replace(/^["']|["']$/g, '').trim();
    if (!secret || secret.length < 8) {
        throw new Error('JWT_SECRET must be set (min 8 characters)');
    }
    return secret;
}

function jwtExpiresIn() {
    return (
        process.env.JWT_EXPIRE?.trim() ||
        process.env.JWT_EXPIRES_IN?.trim() ||
        '7d'
    );
}

function signToken(user) {
    return jwt.sign(
        { sub: user._id.toString(), role: user.role },
        jwtSecret(),
        { expiresIn: jwtExpiresIn() }
    );
}

function serializeUser(doc) {
    const o = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    delete o.password;
    return {
        id: o._id,
        name: o.name,
        email: o.email,
        role: o.role,
        phone: o.phone,
        address: o.address,
        city: o.city,
        state: o.state,
        zip: o.zip,
        country: o.country,
        image: o.image,
        isActive: o.isActive,
        isVerified: o.isVerified,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
    };
}

export const register = async (req, res, next) => {
    try {
        try {
            jwtSecret();
        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }

        const { name, email, password } = req.body ?? {};

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'name, email, and password are required',
            });
        }

        if (String(password).length < 4) {
            return res.status(400).json({
                success: false,
                message: 'password must be at least 4 characters',
            });
        }

        try {
            const user = await User.create({
                name: String(name).trim(),
                email: String(email).trim().toLowerCase(),
                password: String(password),
                role: 'user',
            });

            const token = signToken(user);
            return res.status(201).json({
                success: true,
                data: {
                    user: serializeUser(user),
                    token,
                },
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered',
                });
            }
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        try {
            jwtSecret();
        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }

        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'email and password are required',
            });
        }

        const user = await User.findOne({
            email: String(email).trim().toLowerCase(),
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const match = await user.comparePassword(String(password));
        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is disabled',
            });
        }

        const token = signToken(user);
        return res.status(200).json({
            success: true,
            data: {
                user: serializeUser(user),
                token,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * JWTs are stateless: invalidation happens on the client (remove token from
 * memory / localStorage). This route confirms logout and clears auth cookies if used.
 */
export const logout = (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.clearCookie('access_token', { path: '/' });
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
