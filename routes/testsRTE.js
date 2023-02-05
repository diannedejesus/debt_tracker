import express from 'express'
import * as testController from '../controllers/testsCNTLR.js' 
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

const router = express.Router()

router.get('/demoDebtor', ensureAuth, testController.demoDebtor)
router.post('/demoPayments', ensureAuth, testController.demoPayments)



export default router