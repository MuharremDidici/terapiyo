import { Request, Response, NextFunction } from 'express';
import PsychologistModel, { IPsychologist, ExpertiseArea } from '../models/Psychologist';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import UserModel from '../models/User';
import mongoose from 'mongoose';

// Psikolog profili oluşturma
export const createPsychologistProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const { firstName, lastName, expertiseAreas, bio, education, experience } = req.body;

        if (!firstName || !lastName || !expertiseAreas || !bio || !education || !experience) {
            return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
        }

        if (!expertiseAreas.every((area: ExpertiseArea) => Object.values(ExpertiseArea).includes(area))) {
            return res.status(400).json({ message: 'Geçersiz uzmanlık alanı.' });
        }

        const existingProfile = await PsychologistModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (existingProfile) {
            return res.status(400).json({ message: 'Bu kullanıcı için zaten bir psikolog profili var.' });
        }

        const newPsychologist: IPsychologist = new PsychologistModel({
            userId: new mongoose.Types.ObjectId(userId),
            firstName,
            lastName,
            expertiseAreas,
            bio,
            education,
            experience,
            isApproved: false,
        });

        await newPsychologist.save();

        await UserModel.findByIdAndUpdate(userId, { role: 'psychologist' });

        res.status(201).json({
            message: 'Psikolog profili başarıyla oluşturuldu.',
            profileId: newPsychologist._id
        });
    } catch (error) {
        console.error('Psikolog profili oluşturma hatası:', error);
        next(error); // Hata yönetimi için next fonksiyonunu çağır
    }
};

// Tüm onaylanmış psikolog profillerini getirme
export const getApprovedPsychologists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const psychologists = await PsychologistModel.find({ isApproved: true }).populate({path: 'userId',
            select: 'email firstName lastName'});
            console.log("Onaylanmış psikologlar:", psychologists); // Psikologları konsola yazdır
        res.status(200).json(psychologists);
    } catch (error) {
        console.error('Onaylanmış psikolog profilleri alınırken hata:', error);
        next(error); // Hata yönetimi için next fonksiyonunu çağır
    }
};

// Belirli bir psikolog profilini ID'ye göre getirme
export const getPsychologistById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const psychologist = await PsychologistModel.findById(id).populate('userId', ['email', 'firstName', 'lastName']);

        if (!psychologist) {
            return res.status(404).json({ message: 'Psikolog profili bulunamadı.' });
        }

        res.status(200).json(psychologist);
    } catch (error) {
        console.error('Psikolog profili alınırken hata:', error);
        next(error); // Hata yönetimi için next fonksiyonunu çağır
    }
};

// Psikolog profilini güncelleme
export const updatePsychologistProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const { firstName, lastName, expertiseAreas, bio, education, experience } = req.body;

        if (!firstName || !lastName || (!expertiseAreas && !bio && !education && !experience)) {
            return res.status(400).json({ message: 'En az bir alan güncellenmelidir.' });
        }

        if (expertiseAreas && !expertiseAreas.every((area: ExpertiseArea) => Object.values(ExpertiseArea).includes(area))) {
            return res.status(400).json({ message: 'Geçersiz uzmanlık alanı.' });
        }

        const updatedProfile = await PsychologistModel.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(userId) },
            { firstName, lastName, expertiseAreas, bio, education, experience },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Psikolog profili bulunamadı.' });
        }

        res.status(200).json({ message: 'Psikolog profili başarıyla güncellendi.', profile: updatedProfile });

    } catch (error) {
        console.error('Psikolog profili güncelleme hatası:', error);
        next(error); // Hata yönetimi için next fonksiyonunu çağır
    }
};

// Yorum ekleme
export const addRating = (async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const { psychologistId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?.userId;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Yorum ve puan alanları zorunludur.' });
        }

        const psychologist = await PsychologistModel.findById(psychologistId);
        if (!psychologist) {
            return res.status(404).json({ message: 'Psikolog bulunamadı.' });
        }

        // Yeni yorumu geçici bir değişkene atayın
        const newRating = {
            userId: new mongoose.Types.ObjectId(userId) as unknown as mongoose.Schema.Types.ObjectId,
            rating,
            comment
        };

        // Yeni yorumu ekle
        psychologist.ratings.push(newRating);

        // Ortalama puanı güncelle
        const totalRating = psychologist.ratings.reduce((sum, r) => sum + r.rating, 0);
        psychologist.averageRating = totalRating / psychologist.ratings.length;

        await psychologist.save();

        return res.status(201).json({ message: 'Yorum başarıyla eklendi.', ratings: psychologist.ratings, averageRating: psychologist.averageRating });
    } catch (error) {
        console.error('Yorum ekleme hatası:', error);
        next(error);
        return res.status(500).json({ message: 'Sunucu hatası.' }); // Hata durumunda da Response döndür
    }
});

// Yorumları getirme (psikologId'ye göre)
export const getRatingsByPsychologist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { psychologistId } = req.params;

        const psychologist = await PsychologistModel.findById(psychologistId);

        if (!psychologist) {
            return res.status(404).json({ message: 'Psikolog bulunamadı.' });
        }

        const ratingsWithUserInfo = await PsychologistModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(psychologistId) } },
            { $unwind: '$ratings' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'ratings.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    rating: '$ratings.rating',
                    comment: '$ratings.comment',
                    createdAt: '$ratings.createdAt',
                    'user._id': '$user._id',
                    'user.firstName': '$user.firstName',
                    'user.lastName': '$user.lastName',
                    'user.email': '$user.email'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    ratings: {
                        $push: {
                            rating: '$rating',
                            comment: '$comment',
                            createdAt: '$createdAt',
                            user: {
                                _id: '$user._id',
                                firstName: '$user.firstName',
                                lastName: '$user.lastName',
                                email: '$user.email'
                            }
                        }
                    },
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        if (ratingsWithUserInfo.length === 0) {
            return res.status(200).json({ ratings: [], averageRating: 0 });
        }

        res.status(200).json({
            ratings: ratingsWithUserInfo[0].ratings,
            averageRating: ratingsWithUserInfo[0].averageRating
        });
    } catch (error) {
        console.error('Yorumları getirme hatası:', error);
        next(error); // Hata yönetimi için next fonksiyonunu çağır
    }
};

// Yorum güncelleme (yalnızca kendi yorumunu güncelleyebilir)
export const updateRating = (async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const { psychologistId, ratingId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?.userId;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Yorum ve puan alanları zorunludur.' });
        }

        const psychologist = await PsychologistModel.findById(psychologistId);
        if (!psychologist) {
            return res.status(404).json({ message: 'Psikolog bulunamadı.' });
        }

        const ratingToUpdate = psychologist.ratings.find(r => r._id && r._id.toString() === ratingId); // _id kontrolü eklendi

        if (!ratingToUpdate) {
            return res.status(404).json({ message: 'Yorum bulunamadı.' });
        }

        if (ratingToUpdate.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Bu yorumu güncelleme yetkiniz yok.' });
        }

        ratingToUpdate.rating = rating;
        ratingToUpdate.comment = comment;

        const totalRating = psychologist.ratings.reduce((sum, r) => sum + r.rating, 0);
        psychologist.averageRating = totalRating / psychologist.ratings.length;

        await psychologist.save();

        return res.status(200).json({ message: 'Yorum başarıyla güncellendi.', ratings: psychologist.ratings, averageRating: psychologist.averageRating });
    } catch (error) {
        console.error('Yorum güncelleme hatası:', error);
        next(error);
        return res.status(500).json({ message: 'Sunucu hatası.' }); // Hata durumunda da Response döndür
    }
});