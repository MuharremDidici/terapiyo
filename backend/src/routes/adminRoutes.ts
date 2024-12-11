import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { getPendingPsychologists, approvePsychologist, rejectPsychologist } from '../controllers/adminController';
import { asyncHandlerResponse } from "../utils/asyncHandler";

const router = express.Router();

// Onay bekleyen psikologları getir (sadece admin)


router.get('/pending-psychologists', authenticateToken, authorizeRole(['admin']), getPendingPsychologists);


// Psikolog profilini onayla (sadece admin)
router.put('/approve-psychologist/:psychologistId', authenticateToken, authorizeRole(['admin']), approvePsychologist);

// Psikolog profilini reddet (sadece admin)
router.delete('/reject-psychologist/:psychologistId', authenticateToken, authorizeRole(['admin']), rejectPsychologist);

export default router;