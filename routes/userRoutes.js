const express = require('express');
const passport = require('passport');
const router = express.Router();
const userController = require('../controllers/userController');

// #region "Register route"
router.post('/register', userController.createUser);
router.get('/register', userController.registerForm);
// #endregion

// #region "Login route"
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) { return next(err) }
    if (!user) { return res.sendStatus(401) }
    else {
      req.logIn(user, () => {
        res.sendStatus(200)
      })
    }
  })(req, res, next);
});
// #endregion

module.exports = router;
