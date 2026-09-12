const isAuthenticated = async (req, res, next) => {
  res.sendStatus(401);
}

module.exports = isAuthenticated;