const express = require('express')
const router = express.Router()
const mainController = require('../controllers/mainCNTLR') //path to the controller this route will lead too. This is basically a list of functions we can choose from.


router.get('/', mainController.index) //define a url and which code to execute for that url. In this example if the url / is accessed (the root/default page) then execute the function index from the file that is stored in mainController

module.exports = router