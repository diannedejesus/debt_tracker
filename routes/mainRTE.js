import express from 'express'
const router = express.Router()
import * as mainController from '../controllers/mainCNTLR.js' //path to the controller this route will lead too. This is basically a list of functions we can choose from.
//const passport = require('../config/passport') // handle authentication (logins) for this application
import { ensureAuth, ensureGuest } from '../middleware/auth.js';



router.get('/', ensureGuest, mainController.index) //define a url and which code to execute for that url. In this example if the url / is accessed (the root/default page) then execute the function index from the file that is stored in mainController

router.get('/asyncFunc', mainController.useAsyncFunction) //define a url and which code to execute for that url. In this example if the url /asyncFunc is accessed then execute the function useAsyncFunction from the file that is stored in mainController
router.get('/dashboard', ensureAuth, mainController.getDashboard) //define a url and which code to execute for that url. In this example if the url /func is accessed then execute the function useFunction from the file that is stored in mainController

router.get('/administrator', mainController.getAdminCreator)

router.post('/administrator', mainController.createAdmin)


export default router