'use strict';

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function guardProd(req, res, next) {
  if (env.isProd) return next(new AppError(403, 'FORBIDDEN', '디버그 API는 production에서 사용할 수 없어요'));
  next();
}

// 수집 결과 확인용 (해커톤 한정). 실제 1365/VMS 호출은 sync job에서 수행.
router.get('/1365', guardProd, asyncHandler(async (req, res) => {
  const { fetchAndNormalize1365 } = require('../services/external1365.service');
  const items = await fetchAndNormalize1365({ numOfRows: Number(req.query.numOfRows) || 10, pageNo: 1, dryRun: true });
  sendSuccess(res, { count: items.length, items });
}));

router.get('/vms', guardProd, asyncHandler(async (req, res) => {
  const { crawlVms } = require('../services/vmsCrawler.service');
  const items = await crawlVms({ limit: Number(req.query.limit) || 5, dryRun: true });
  sendSuccess(res, { count: items.length, items });
}));

module.exports = router;
