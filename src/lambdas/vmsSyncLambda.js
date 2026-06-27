'use strict';

// AWS Lambda handler. EventBridge cron으로 주기 실행.
// Chrome/ChromeDriver는 Lambda Layer 또는 컨테이너 이미지 전제 (README 참고).
require('../config/env');
const { crawlVms } = require('../services/vmsCrawler.service');
const prisma = require('../libs/prisma');

// eslint-disable-next-line no-unused-vars
exports.handler = async (event) => {
  try {
    const result = await crawlVms({});
    // eslint-disable-next-line no-console
    console.log(`[lambda:vms] saved=${result.saved} failed=${result.failed.length}`);
    return { statusCode: 200, body: JSON.stringify({ saved: result.saved, failed: result.failed.length }) };
  } catch (e) {
    // 전체 실패해도 기존 DB 캐시는 보존. 다음 주기에 재시도.
    // eslint-disable-next-line no-console
    console.error('[lambda:vms] error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  } finally {
    await prisma.$disconnect();
  }
};
