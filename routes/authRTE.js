import express from 'express' //copied and pasted from microsoft nothing new needs to be changed
//const passport = require('passport')
const router = express.Router()
import * as authController from '../controllers/authCNTLR.js';
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

router.get('/', ensureGuest, authController.getLogin);

router.post('/user', ensureAuth, authController.addUser);
router.get('/user', ensureAuth, authController.getUserAdmin);

router.post('/admin', authController.addAdmin);
router.get('/admin', authController.getAdmin);

router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.loginUser);

// router.get('/login', ensureGuest, authController.getLogin);
// router.post('/login', ensureGuest, authController.loginUser);

// router.get('/verifyAccount', ensureGuest, authController.getVerifyAccount);
// router.post('/verifyAccount', ensureGuest, authController.VerifyAccount);

router.get('/logout', authController.logout);

export default router
