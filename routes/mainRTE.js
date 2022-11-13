import express from 'express'
import * as mainController from '../controllers/mainCNTLR.js' 
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

const router = express.Router()



router.get('/', mainController.index)
router.get('/dashboard', ensureAuth, mainController.getDashboard)
router.get('/debtors', ensureAuth, mainController.getDebtorList)

router.get('/registerdebt', ensureAuth, mainController.getRegdebt)
router.post('/registerdebt', ensureAuth, mainController.insertNewDebt)

router.get('/registerpayment', ensureAuth, mainController.getRegPayment)
router.post('/registerpayment', ensureAuth, mainController.insertNewPayment)

router.get('/cases/:id',  ensureAuth, mainController.getCaseInfo)
router.get('/testcase/:id',  ensureAuth, mainController.getTestCaseInfo)
router.get('/printview/:id',  ensureAuth, mainController.getPrintView)
router.get('/cases-merge/:id',  ensureAuth, mainController.getCaseInfoMerge)



export default router