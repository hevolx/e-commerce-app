const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// #region "Register route"
router.post('/register', userController.createUser);
router.get('/register', userController.registerForm);
// #endregion

// #region "Login route"
router.post('/login', userController.loginUser);
router.get('/login', userController.loginForm);
// #endregion

// #region "Logout route"
router.post('/logout', userController.logoutUser);
// #endregion

module.exports = router;
