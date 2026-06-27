'use strict';

const AppError = require('../utils/AppError');

module.exports = function notFound(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', `요청하신 경로를 찾을 수 없어요: ${req.method} ${req.originalUrl}`));
};
