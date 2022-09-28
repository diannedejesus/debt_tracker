import express from 'express' //copied and pasted from microsoft nothing new needs to be changed
import * as authController from '../controllers/authCNTLR.js';
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

const router = express.Router()


router.get('/', ensureGuest, authController.getLogin);

router.post('/user', ensureAuth, authController.addUser);
router.get('/user', ensureAuth, authController.getUserAdmin);

router.post('/admin', authController.addAdmin);
router.get('/admin', authController.getCreateAdmin);

router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.loginUser);

router.get('/reset', authController.getReset);
router.post('/reset', authController.resetPassword);

//router.get('/sendcode', authController.createCode)


// router.get('/verifyAccount', ensureGuest, authController.getVerifyAccount);
// router.post('/verifyAccount', ensureGuest, authController.VerifyAccount);

router.get('/logout', authController.logout);



export default router
