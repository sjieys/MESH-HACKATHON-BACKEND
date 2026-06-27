'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// 필수 인증: 토큰 없거나 무효면 401
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized());
  }
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.userId };
    return next();
  } catch (err) {
    return next(AppError.unauthorized());
  }
}

// 선택 인증: 토큰 있으면 req.user 세팅, 없거나 무효면 그냥 통과(public)
function authOptional(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, env.jwt.secret);
      req.user = { id: payload.userId };
    } catch (err) {
      // 무효 토큰은 무시하고 비로그인으로 처리
    }
  }
  return next();
}

module.exports = { authRequired, authOptional };
