import express from 'express';
import { login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middlware.js';

const router = express.Router();

router.post('/signup',signup);

router.post('/login', login);

router.post('/logout', logout);

router.put('/update-profile', protectRoute , updateProfile);

router.get('/check', protectRoute, (req, res) => {
    const user = req.user && typeof req.user.toObject === 'function' ? req.user.toObject() : req.user;
    return res.status(200).json(user);
})

export default router;