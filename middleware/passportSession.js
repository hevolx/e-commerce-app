const passport = require('passport');

/** Initializes Passport and hooks it into the existing session. */
module.exports = [passport.initialize(), passport.session()];
