'use strict';

// VMS 크롤링 job. `npm run sync:vms`로 로컬 실행 가능.
require('../config/env');
const { crawlVms } = require('../services/vmsCrawler.service');
const prisma = require('../libs/prisma');

async function run() {
  // eslint-disable-next-line no-console
  console.log('[sync:vms] start');
  const result = await crawlVms({});
  // eslint-disable-next-line no-console
  console.log(`[sync:vms] done. saved=${result.saved} failed=${result.failed.length}`);
  return result;
}

if (require.main === module) {
  run()
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error('[sync:vms] fatal:', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { run };
