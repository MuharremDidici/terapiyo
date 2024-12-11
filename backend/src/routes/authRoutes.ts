import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = express.Router();

// Kullanıcı kaydı için POST isteği
router.post('/register', (req, res, next) => {
    registerUser(req, res, next).catch(next);
  });
  

// Kullanıcı girişi için POST isteği
router.post('/login', (req, res, next) => {
  loginUser(req, res, next).catch(next);
});

export default router;