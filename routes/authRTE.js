const express = require('express') //copied and pasted from microsoft nothing new needs to be changed
//const passport = require('passport')
const router = express.Router()
const authController = require('../controllers/authCNTLR');

router.get('/', authController.getPage);

router.post('/user', authController.addUser);
router.get('/user', authController.getUser);

router.post('/admin', authController.addAdmin);
router.get('/admin', authController.getAdmin);

router.get('/logout', authController.logout);

module.exports = router
