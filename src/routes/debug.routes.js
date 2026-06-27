'use strict';

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const prisma = require('../libs/prisma');
const authService = require('../services/auth.service');

function guardProd(req, res, next) {
  if (env.isProd) return next(new AppError(403, 'FORBIDDEN', '디버그 API는 production에서 사용할 수 없어요'));
  next();
}

// 테스트용 계정 로그인 (프론트 개발용 - 해커톤 한정으로 production도 허용)
// GET /api/debug/test-login?userId=1  (userId 생략 시 기본 test-001)
router.get('/test-login', asyncHandler(async (req, res) => {
  const testId = String(req.query.userId || '1');
  const providerId = `test-user-${testId}`;

  const user = await prisma.user.upsert({
    where: { provider_providerId: { provider: 'GOOGLE', providerId } },
    create: {
      provider: 'GOOGLE',
      providerId,
      email: `test${testId}@voda.dev`,
      nickname: `테스터${testId}`,
      lastLoginAt: new Date(),
    },
    update: { lastLoginAt: new Date() },
  });

  const token = authService.issueToken(user.id);
  sendSuccess(res, { token, userId: user.id, nickname: user.nickname }, 200);
}));

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
