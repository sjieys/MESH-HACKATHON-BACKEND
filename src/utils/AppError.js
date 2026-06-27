'use strict';

// 애플리케이션 표준 에러
class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = '입력값을 확인해 주세요', details = null) {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = '다시 로그인해 주세요') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = '권한이 없어요') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = '리소스를 찾을 수 없어요') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message = '이미 처리된 요청이에요') {
    return new AppError(409, 'CONFLICT', message);
  }

  static businessRule(message = '요청을 처리할 수 없어요', details = null) {
    return new AppError(422, 'BUSINESS_RULE_ERROR', message, details);
  }

  static external(message = '외부 서비스 오류가 발생했어요') {
    return new AppError(502, 'EXTERNAL_API_ERROR', message);
  }

  static internal(message = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요') {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

module.exports = AppError;
