'use strict';

const client = require('../external/openapi1365.client');
const volunteerRepo = require('../repositories/volunteer.repository');
const { from1365 } = require('../mappers/sourceVolunteer.mapper');

// 동시성 제한 병렬 실행
async function mapWithConcurrency(items, limit, fn) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const cur = idx;
      idx += 1;
      // eslint-disable-next-line no-await-in-loop
      results[cur] = await fn(items[cur], cur);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

// 목록 -> 상세 병합 -> 정규화. dryRun이면 DB 저장 없이 반환만.
async function fetchAndNormalize1365({ pageNo = 1, numOfRows = 10, concurrency = 5, dryRun = false } = {}) {
  const listItems = await client.fetchList({ pageNo, numOfRows });

  const merged = await mapWithConcurrency(listItems, concurrency, async (listItem) => {
    const regNo = listItem.progrmRegistNo;
    let detail = null;
    if (regNo) {
      detail = await client.fetchDetail(regNo);
    }
    return { ...listItem, ...(detail || {}) };
  });

  const normalized = merged
    .map((m) => {
      try {
        return from1365(m);
      } catch (e) {
        return null;
      }
    })
    .filter((x) => x && x.sourceId);

  if (dryRun) return normalized;

  const saved = [];
  for (const item of normalized) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const row = await volunteerRepo.upsertFromSource(item);
      saved.push(row);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[1365 upsert 실패]', item.sourceId, e.message);
    }
  }
  return saved;
}

module.exports = { fetchAndNormalize1365, mapWithConcurrency };
