import express from 'express';
import {
    createSession,
    getSessionsByPsychologist,
    getSessionsByUser,
    updateSessionStatus,
    cancelSession,
    getSessions
} from '../controllers/sessionController';
import { AuthenticatedRequest, authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

// Yeni seans oluştur (oturum açmış herhangi bir kullanıcı)
router.post('/', authenticateToken, authorizeRole(['admin', 'psychologist', 'user']), (req, res, next) => {
    createSession(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Psikologa göre seansları listele (yalnızca admin ve ilgili psikolog
router.get('/psychologist/:psychologistId', authenticateToken, authorizeRole(['admin', 'psychologist']), (req, res, next) => {
    getSessionsByPsychologist(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Kullanıcıya göre seansları listele (oturum açmış kullanıcı, kendi seanslarını görebilir)
router.get('/user/:userId', authenticateToken, authorizeRole(['admin', 'psychologist', 'user']), (req, res, next) => {
    getSessionsByUser(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Admin  için tüm seansları listele
router.get('/', authenticateToken, authorizeRole(['admin']), (req, res, next) => {
    getSessions(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Seans durumunu güncelle (yalnızca 'admin' ve ilgili 'psychologist')
router.put('/:sessionId/status', authenticateToken, authorizeRole(['admin', 'psychologist']), (req, res, next) => {
    updateSessionStatus(req as AuthenticatedRequest, res, next)
        .catch(next);
});

// Seans iptal et (yalnızca 'admin' ve ilgili 'psychologist' veya 'user')
router.delete('/:sessionId', authenticateToken, authorizeRole(['admin', 'psychologist']), (req, res, next) => {
    cancelSession(req as AuthenticatedRequest, res, next)
        .catch(next);
});
router.post('/', authenticateToken, authorizeRole(['admin', 'psychologist', 'user']), (req, res, next) => {
    createSession(req as AuthenticatedRequest, res, next)
        .catch(next);
});

export default router;