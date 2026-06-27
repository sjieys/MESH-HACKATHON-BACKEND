'use strict';

const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const AppError = require('../utils/AppError');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요';
  let details = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = '입력값을 확인해 주세요';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      code = 'CONFLICT';
      message = '이미 존재하는 데이터예요';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = '대상을 찾을 수 없어요';
    } else {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
      message = '데이터 처리 중 오류가 발생했어요';
    }
  } else if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = '다시 로그인해 주세요';
  }

  if (statusCode >= 500) {
    // 서버 에러는 로깅
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
  }

  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  if (!env.isProd && statusCode >= 500) body.error.stack = err.stack;

  res.status(statusCode).json(body);
};
