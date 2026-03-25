import jwt from 'jsonwebtoken';

function jwtSecret() {
    const secret = process.env.JWT_SECRET?.replace(/^["']|["']$/g, '').trim();
    if (!secret || secret.length < 8) {
        throw new Error('JWT_SECRET must be set (min 8 characters)');
    }
    return secret;
}

export function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, jwtSecret());
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}
