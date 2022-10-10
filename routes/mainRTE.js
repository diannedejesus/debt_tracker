import express from 'express'
import * as mainController from '../controllers/mainCNTLR.js' 
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

const router = express.Router()



router.get('/', mainController.index) 
router.get('/dashboard', mainController.getDashboard)

router.get('/registerdebt', mainController.getRegdebt)
router.post('/registerdebt', mainController.regdebt)

router.get('/registerpayment', mainController.getRegPayment)
router.post('/registerpayment', mainController.regPayment)

router.get('/cases/:id', mainController.getCaseInfo)





export default router