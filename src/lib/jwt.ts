/**
 * JWT Authentication Utilities
 * 
 * หมายเหตุ: ต้องติดตั้ง dependencies ก่อนใช้งาน
 * npm install jsonwebtoken @types/jsonwebtoken
 */

import jwt from 'jsonwebtoken';

// JWT Secret (ควรเก็บใน .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d'; // 7 วัน

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * สร้าง JWT token
 */
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

/**
 * ตรวจสอบและ decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * สร้าง refresh token (อายุยาวกว่า access token)
 */
export function generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '30d', // 30 วัน
    });
}

/**
 * ดึง token จาก Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;

    // รองรับทั้ง "Bearer <token>" และ "<token>"
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return authHeader;
}

/**
 * สร้าง token response object
 */
export function createTokenResponse(user: { id: string; email: string; role: string }) {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: JWT_EXPIRES_IN,
    };
}
