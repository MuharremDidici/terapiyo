import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UserRole, IUser } from '../models/User';
import UserModel from '../models/User';
import { generateToken } from '../utils/auth';

// Kullanıcı kaydı (Sign Up)
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, role, firstName, lastName, profilePicture } = req.body;

        // Gerekli alanların kontrolü
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Email, şifre ve rol alanları zorunludur.' });
        }

        // Kullanıcı rolünün geçerli olup olmadığını kontrol et
        if (!Object.values(UserRole).includes(role)) {
            return res.status(400).json({ message: 'Geçersiz kullanıcı rolü.' });
        }

        // E-posta adresinin benzersiz olup olmadığını kontrol et
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcıyı oluştur ve veritabanına kaydet
        const newUser: IUser = new UserModel({
            email,
            password: hashedPassword,
            role,
            firstName, // Yeni alan
            lastName, // Yeni alan
            profilePicture, // Yeni alan
        });
        await newUser.save();

        // JWT oluştur
        const token = generateToken(newUser._id.toString(), newUser.role);

        // Başarı durumunda yanıt döndür
        res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.', token });
    } catch (error) {
        console.error('Kullanıcı kaydı sırasında hata:', error);
        next(error); // Hata yönetimi için next fonksiyonunu çağır
    }
};

// Kullanıcı girişi (Sign In)
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Gerekli alanların kontrolü
        if (!email || !password) {
            return res.status(400).json({ message: 'Email ve şifre alanları zorunludur.' });
        }

        // Kullanıcıyı e-posta adresine göre bul
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        // Şifre kontrolü
        if (user.password && await bcrypt.compare(password, user.password)) {
            // JWT oluştur
            const token = generateToken(user._id.toString(), user.role);

            // Başarı durumunda yanıt döndür (token ile birlikte)
            res.status(200).json({ message: 'Giriş başarılı.', token, userId: user._id.toString() });
        } else {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }
    } catch (error) {
        console.error('Kullanıcı girişi sırasında hata:', error);
        next(error); // Hata yönetimi için next fonksiyonunu çağır
    }
};