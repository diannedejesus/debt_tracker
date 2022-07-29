const express = require('express') //copied and pasted from microsoft nothing new needs to be changed
//const passport = require('passport')
const router = express.Router()
const authController = require('../controllers/authCNTLR');
const {ensureAuth, ensureGuest} = require('../middleware/auth');

router.get('/', ensureGuest, authController.getLogin);

router.post('/user', ensureAuth, authController.addUser);
router.get('/user', ensureAuth, authController.getUserAdmin);

router.post('/admin', authController.addAdmin);
router.get('/admin', authController.getAdmin);

router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.loginUser);

router.get('/logout', authController.logout);

module.exports = router
