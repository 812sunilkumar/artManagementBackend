const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log('token', token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded UserId:', decoded);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;