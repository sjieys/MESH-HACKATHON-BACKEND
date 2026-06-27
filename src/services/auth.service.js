'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function issueToken(userId) {
  return jwt.sign({ userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

module.exports = { issueToken };
