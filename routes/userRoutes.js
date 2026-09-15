const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// #region "Register route"
router.post('/register', userController.createUser);
router.get('/register', userController.renderRegisterForm);
// #endregion

// #region "Login route"
router.post('/login', userController.loginUser);
router.get('/login', userController.renderLoginForm);
// #endregion

// #region "Logout route"
router.post('/logout', userController.logoutUser);
// #endregion

router.get('/users', userController.retriveAllUsers);
router.get('/users/:id', userController.retriveUser);

router.put('/users/:id', userController.updateUser);

router.get('/account', userController.renderAccount);

router.post('/account', userController.updateAccount);
module.exports = router;
