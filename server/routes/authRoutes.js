import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
// Only admins can register new users (like Faculty and Students)
router.post('/register', protect, admin, registerUser);

export default router;
