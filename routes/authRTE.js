import express from 'express' //copied and pasted from microsoft nothing new needs to be changed
import * as authController from '../controllers/authCNTLR.js';
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

const router = express.Router()


router.get('/', ensureGuest, authController.getLogin);

router.get('/user', ensureAuth, authController.getUserAdmin);
router.post('/user', ensureAuth, authController.addUser);

router.get('/admin', authController.getCreateAdmin);
router.post('/admin', authController.addAdmin);

router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.loginUser);

router.get('/reset', ensureAuth, authController.getReset);
router.post('/reset', ensureAuth, authController.resetPassword);

router.get('/verifyaccount/:token/:userid', authController.getVerifyAccount);
router.get('/verifyaccount', authController.getVerifyAccount);
router.post('/verifyaccount', authController.authenticateUser);

router.get('/logout', ensureAuth, authController.logout);


export default router
