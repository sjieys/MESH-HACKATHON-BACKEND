'use strict';

// zod 스키마로 body/query/params 검증.
// 검증 통과한 값을 req에 다시 저장한다. (query transform 반영)
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
      if (schemas.params) req.validatedParams = schemas.params.parse(req.params);
      return next();
    } catch (err) {
      return next(err); // ZodError는 error.middleware에서 처리
    }
  };
}

module.exports = { validate };
