import express from 'express';
import {
    createPsychologistProfile,
    getApprovedPsychologists,
    getPsychologistById,
    updatePsychologistProfile,
    addRating,
    getRatingsByPsychologist,
    updateRating
} from '../controllers/psychologistController';
import { AuthenticatedRequest, authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

// Psikolog profili oluştur (yalnızca 'psychologist' rolündeki kullanıcılar)
router.post('/', authenticateToken, authorizeRole(['psychologist']), (req, res, next) => {
    createPsychologistProfile(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Tüm onaylanmış psikolog profillerini getir (herkes erişebilir)
router.get('/', getApprovedPsychologists);

// Belirli bir psikolog profilini ID'ye göre getir (herkes erişebilir)
router.get('/:id', authenticateToken, authorizeRole(['psychologist']), (req, res, next) => {
    getPsychologistById(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Psikolog profilini güncelle (yalnızca 'psychologist' rolündeki kullanıcılar)
router.put('/', authenticateToken, authorizeRole(['psychologist']), (req, res, next) => {
    updatePsychologistProfile(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Yorum ekle
router.post('/:psychologistId/ratings', authenticateToken, authorizeRole(['psychologist']), (req, res, next) => {
    addRating(req as AuthenticatedRequest, res, next)
        .catch(next);
});


// Yorumları listele
router.get('/:psychologistId/ratings', authenticateToken, authorizeRole(['psychologist']), (req, res, next) => {
    getRatingsByPsychologist(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Yorum güncelle
router.put('/:psychologistId/ratings/:ratingId', authenticateToken, authorizeRole(['psychologist']), (req, res, next) => {
    updateRating(req as AuthenticatedRequest, res, next)
        .catch(next);
});

export default router;