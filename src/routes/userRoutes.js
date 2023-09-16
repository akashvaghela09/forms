const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/test', userController.authenticate, userController.test);

module.exports = router;
