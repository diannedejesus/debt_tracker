import express from 'express'
import * as mainController from '../controllers/mainCNTLR.js' 
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

const router = express.Router()



router.get('/', mainController.index) 
router.get('/dashboard', mainController.getDashboard)
router.get('/debtors', mainController.getDebtorList)

router.get('/registerdebt', mainController.getRegdebt)
router.post('/registerdebt', mainController.insertNewDebt)

router.get('/registerpayment', mainController.getRegPayment)
router.post('/registerpayment', mainController.insertNewPayment)

router.get('/cases/:id', mainController.getCaseInfo)





export default router