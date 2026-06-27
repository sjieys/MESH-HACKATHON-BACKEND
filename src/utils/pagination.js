'use strict';

function getPagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const size = Math.min(100, Math.max(1, Number(query.size) || 20));
  const skip = (page - 1) * size;
  return { page, size, skip, take: size };
}

function buildPageResult(items, totalCount, page, size) {
  return { items, page, size, totalCount };
}

module.exports = { getPagination, buildPageResult };
