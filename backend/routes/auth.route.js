import express from 'express'
import { signup } from '../controllers/auth.controller.js';
// import { register } from '../controllers/auth.controller.js';
// import { logout } from '../controllers/auth.controller.js';

const router = express.Router()

//signup -> it's a callback func and it's calling the signup
router.get('/signup', signup);
// router.get('/register', register);
// router.get('/logout', logout);

export default router;