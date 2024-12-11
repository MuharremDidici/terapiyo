import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; role: string };
}
export function generateToken(userId: string, role: string): string {
    const payload = { userId, role };
    const options = { expiresIn: '1h' }; // Token 1 saat geçerli olacak
    return jwt.sign(payload, process.env.JWT_SECRET!, options);
}

export function verifyToken(token: string): { userId: string; role: string } | null { // export ekleyin
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
        return decoded;
    } catch (error) {
        return null;
    }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Authorization başlığından token'ı al
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Token yoksa 401 hatası döndür
    if (token == null) {
        res.sendStatus(401);
        return; // Fonksiyondan erken çık
    }

    // Token'ı doğrula
    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (err) {
            console.error('JWT Doğrulama Hatası:', err);
            res.sendStatus(403); // Geçersiz token için 403 hatası
            return; // Fonksiyondan erken çık
        }

        // Token geçerliyse, çözümlenmiş kullanıcı bilgilerini req nesnesine ekle
        req.user = user as { userId: string; role: string };

        // Sonraki middleware veya route handlera geç
        next();
    });
};

export const authorizeRole = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        // Kullanıcının rolü, izin verilen rollerden biriyse, sonraki fonksiyona geç
        if (userRole && allowedRoles.includes(userRole)) {
            next();
        } else {
            res.sendStatus(403); // Yetkisiz erişim için 403 hatası
        }
    };
};