const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuthenticated = require('../middleware/isAuthenticated');

// #region "Register route"
/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 */
router.post('/register', userController.createUser);
router.get('/register', userController.renderRegisterForm);
// #endregion

// #region "Login route"
/**
 * @openapi
 * /login:
 *   post:
 *     summary: Log in with username and password
 */
router.post('/login', userController.loginUser);
router.get('/login', userController.renderLoginForm);
// #endregion

// #region "Logout route"
/**
 * @openapi
 * /logout:
 *   post:
 *     summary: Log out and end the session
 */
router.post('/logout', userController.logoutUser);
// #endregion

router.get('/users', userController.retriveAllUsers);
router.get('/users/:id', isAuthenticated, userController.retriveUser);

router.delete('/users/:id', isAuthenticated, userController.deleteUser)

router.put('/users/:id', isAuthenticated, userController.updateUser);

router.get('/account', userController.renderAccount);

router.post('/account', isAuthenticated, userController.updateAccount);

router.post('/account/delete', isAuthenticated, userController.deleteAccount);
module.exports = router;
