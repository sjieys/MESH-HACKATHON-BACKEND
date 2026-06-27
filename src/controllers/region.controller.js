'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const regionService = require('../services/region.service');

const list = asyncHandler(async (req, res) => {
  const sidoCd = req.query.sidoCd ? Number(req.query.sidoCd) : null;
  if (req.query.sidoCd && Number.isNaN(sidoCd)) {
    const AppError = require('../utils/AppError');
    throw AppError.badRequest('지역 정보를 확인해 주세요');
  }
  sendSuccess(res, regionService.getRegions(sidoCd));
});

module.exports = { list };
