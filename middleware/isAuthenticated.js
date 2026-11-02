const wantsHtml = require('../utils/wantsHtml');

const isAuthenticated = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return wantsHtml(req) ? res.redirect('/login') : res.sendStatus(401);
  }

  next();
}

module.exports = isAuthenticated;
