import express from 'express'
import { signup, login, logout } from '../controllers/auth.controller.js';

const router = express.Router()

//signup -> it's a callback func and it's calling the signup
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router;