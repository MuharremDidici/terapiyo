import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: string };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Authorization başlığından token'ı al
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Token yoksa 401 hatası döndür
  if (token == null) {
    res.sendStatus(401); // return ifadesi kaldırıldı
    return; // Erken çıkış için return eklendi
  }

  // Token'ı doğrula
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      console.error('JWT Doğrulama Hatası:', err);
      res.sendStatus(403); // Geçersiz token için 403 hatası, return ifadesi kaldırıldı
      return; // Erken çıkış için return eklendi
    }

    // Token geçerliyse, çözümlenmiş kullanıcı bilgilerini req nesnesine ekle
    req.user = user as { userId: string; role: string };

    // Sonraki middleware veya route handlera geç
    next();
  });
};

// ... diğer importlar

export const authorizeRole = (allowedRoles: string | string[]) => { // allowedRoles artık string veya string dizisi olabilir
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (req.user && (typeof allowedRoles === 'string' ? req.user.role === allowedRoles : allowedRoles.includes(req.user.role))) {
        next();
      } else {
        res.sendStatus(403); // Yetkisiz erişim için 403 hatası
      }
    };
  };

