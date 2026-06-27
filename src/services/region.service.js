'use strict';

const { SIDO, GUGUN, isValidSido } = require('../constants/regions');
const AppError = require('../utils/AppError');

function getRegions(sidoCd) {
  if (sidoCd != null) {
    if (!isValidSido(sidoCd)) throw AppError.badRequest('지역 정보를 확인해 주세요');
    return { sido: SIDO, gugun: { [sidoCd]: GUGUN[sidoCd] || [] } };
  }
  return { sido: SIDO, gugun: GUGUN };
}

module.exports = { getRegions };
