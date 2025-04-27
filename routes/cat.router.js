const router = require('express').Router();
const catController = require('../controller/cat.controller.js');
const auth = require("../middleware/auth")();

router.post('/create',auth.authenticate, auth.authorize(['admin']), catController.createCat);
router.get('/all',auth.authenticate, catController.getAllCats);

module.exports = router;