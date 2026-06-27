'use strict';

const vmsClient = require('../external/vms.client');
const cheerioCrawler = require('../crawlers/vms.cheerioCrawler');
const seleniumCrawler = require('../crawlers/vms.seleniumCrawler');
const volunteerRepo = require('../repositories/volunteer.repository');
const { fromVms } = require('../mappers/sourceVolunteer.mapper');
const env = require('../config/env');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// 상세가 비었는지(주요 필드 부재) 판단
function isDetailEmpty(detail) {
  return !detail || (!detail.title && !detail.actPlace && !detail.status);
}

// 전체 VMS 크롤링. dryRun이면 DB 저장 없이 정규화 결과만 반환.
async function crawlVms({ limit = env.vms.crawlLimit, dryRun = false } = {}) {
  const failed = [];
  const normalized = [];

  let listItems = [];
  try {
    const listHtml = await vmsClient.fetchListHtml({ pageNo: 1 });
    listItems = cheerioCrawler.parseList(listHtml).slice(0, limit);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[vms] 목록 조회 실패:', e.message);
    return dryRun ? [] : { saved: 0, failed: [] };
  }

  for (const base of listItems) {
    try {
      if (!base.detailUrl) {
        // 상세 URL 없으면 저장하지 않음
        failed.push({ seq: base.seq, reason: 'no detailUrl' });
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      let detailHtml = await vmsClient.fetchDetailHtml(base.seq);
      let detail = cheerioCrawler.parseDetail(detailHtml, base);

      // cheerio로 비면 selenium fallback (옵션 켜진 경우)
      if (isDetailEmpty(detail) && env.vms.useSeleniumFallback && seleniumCrawler.isAvailable()) {
        try {
          // eslint-disable-next-line no-await-in-loop
          detailHtml = await seleniumCrawler.fetchDetailHtmlDynamic(base.seq);
          detail = cheerioCrawler.parseDetail(detailHtml, base);
        } catch (se) {
          // eslint-disable-next-line no-console
          console.warn('[vms] selenium fallback 실패:', base.seq, se.message);
        }
      }

      const item = fromVms(detail);
      if (!item.url) {
        failed.push({ seq: base.seq, reason: 'no url after parse' });
        // eslint-disable-next-line no-continue
        continue;
      }
      normalized.push(item);

      // 요청 간 delay
      // eslint-disable-next-line no-await-in-loop
      await sleep(300);
    } catch (e) {
      failed.push({ seq: base.seq, url: base.detailUrl, reason: e.message });
    }
  }

  if (dryRun) return normalized;

  let saved = 0;
  for (const item of normalized) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await volunteerRepo.upsertFromSource(item);
      saved += 1;
    } catch (e) {
      failed.push({ seq: item.sourceId, reason: `upsert: ${e.message}` });
    }
  }

  if (failed.length) {
    // eslint-disable-next-line no-console
    console.warn(`[vms] 실패 ${failed.length}건:`, JSON.stringify(failed.slice(0, 20)));
  }
  return { saved, failed };
}

module.exports = { crawlVms };
