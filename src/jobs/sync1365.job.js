'use strict';

// 1365 동기화 job. `npm run sync:1365`로 로컬 실행 가능.
require('../config/env');
const { fetchAndNormalize1365 } = require('../services/external1365.service');
const env = require('../config/env');
const prisma = require('../libs/prisma');

async function run({ pages = 1, numOfRows = 15 } = {}) {
  // eslint-disable-next-line no-console
  console.log('[sync:1365] start');
  let total = 0;
  for (let page = 1; page <= pages; page += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const saved = await fetchAndNormalize1365({
        pageNo: page,
        numOfRows,
        concurrency: env.vms.crawlConcurrency,
      });
      total += saved.length;
      // eslint-disable-next-line no-console
      console.log(`[sync:1365] page ${page} upserted ${saved.length}`);
      // 요청 간 짧은 delay
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      // 한 페이지 실패가 전체를 죽이지 않게. 기존 캐시는 유지.
      // eslint-disable-next-line no-console
      console.error(`[sync:1365] page ${page} 실패:`, e.message);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`[sync:1365] done. total upserted=${total}`);
  return total;
}

if (require.main === module) {
  run({ pages: Number(process.env.SYNC_1365_PAGES) || 1 })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error('[sync:1365] fatal:', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { run };
