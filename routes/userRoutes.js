const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.createUser);
router.get('/register', userController.registerForm);

module.exports = router;
