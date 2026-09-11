const express = require('express');
const passport = require('passport');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.createUser);
router.get('/register', userController.registerForm);

// Login route
router.post(
  '/login',
  passport.authenticate('local'),
  (req, res) => {
    res.sendStatus(200);
  }
);

module.exports = router;
