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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in
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
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', userController.logoutUser);
// #endregion

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users (admin)
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', userController.retriveAllUsers);
/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     summary: Get a user profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/users/:id', isAuthenticated, userController.retriveUser);

/**
 * @openapi
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', isAuthenticated, userController.deleteUser)

/**
 * @openapi
 * /users/{userId}:
 *   put:
 *     summary: Update a user profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated user profile
 */
router.put('/users/:id', isAuthenticated, userController.updateUser);

router.get('/account', userController.renderAccount);

router.post('/account', isAuthenticated, userController.updateAccount);

router.post('/account/delete', isAuthenticated, userController.deleteAccount);
module.exports = router;
