const express = require('express');
const passport = require('passport');
const router = express.Router();
const userController = require('../controllers/userController');

// #region "Register route"
router.post('/register', userController.createUser);
router.get('/register', userController.registerForm);
// #endregion

// #region "Login route"
router.post(
  '/login',
  passport.authenticate('local'),
  (req, res) => {
    res.sendStatus(200);
  }
);
// #endregion

module.exports = router;
