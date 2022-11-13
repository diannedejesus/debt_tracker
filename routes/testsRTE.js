import express from 'express'
import * as testController from '../controllers/testsCNTLR.js' 
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

const router = express.Router()


router.get('/testcase/:id',  ensureAuth, testController.getTestCaseInfo)



export default router