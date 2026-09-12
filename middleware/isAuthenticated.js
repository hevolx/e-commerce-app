/** Rejects every request with a 401 response without invoking later middleware. */
const isAuthenticated = async (req, res, next) => {
  res.sendStatus(401);
}

module.exports = isAuthenticated;
