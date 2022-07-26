const express = require('express')
const router = express.Router()
const mainController = require('../controllers/mainCNTLR') //path to the controller this route will lead too. This is basically a list of functions we can choose from.
//const passport = require('../config/passport') // handle authentication (logins) for this application
const {ensureAuth, ensureGuest} = require('../middleware/auth');

router.get('/', ensureGuest, mainController.index) //define a url and which code to execute for that url. In this example if the url / is accessed (the root/default page) then execute the function index from the file that is stored in mainController

router.get('/asyncFunc', mainController.useAsyncFunction) //define a url and which code to execute for that url. In this example if the url /asyncFunc is accessed then execute the function useAsyncFunction from the file that is stored in mainController
router.get('/func', ensureAuth, mainController.useFunction) //define a url and which code to execute for that url. In this example if the url /func is accessed then execute the function useFunction from the file that is stored in mainController

router.get('/administrator', mainController.getAdminCreator)

router.post('/administrator', mainController.createAdmin)


module.exports = router