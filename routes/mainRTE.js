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

router.get('/cases/:id', ensureAuth, mainController.getCaseInfo)
router.get('/printview/:id', ensureAuth, mainController.getPrintView)
router.get('/cases-merge/:id', ensureAuth, mainController.getCaseInfoMerge)

router.post('/delPayment/:id', ensureAuth, mainController.deletePayment)

router.get('/editPayment/:fileId/:paymentid', ensureAuth, mainController.getEditPayment)
router.post('/editPayment', ensureAuth, mainController.editPayment)

router.get('/editDebtor/:id', ensureAuth, mainController.getEditDebtor)
router.post('/editDebt', ensureAuth, mainController.editDebt)

router.get('/excusepayment/:id', ensureAuth, mainController.getExcusedPayment)
router.get('/excusepayment', ensureAuth, mainController.getExcusedPayment)
router.post('/excusepayment', ensureAuth, mainController.excusedPayment)



export default router