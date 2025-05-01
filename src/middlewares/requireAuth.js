const jwt = require('jsonwebtoken');

const httpStatus = require('http-status');
const config = require('../config/config');

const requireAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Please authenticate' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // `decoded` should contain user id
    next();
  } catch (err) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;
