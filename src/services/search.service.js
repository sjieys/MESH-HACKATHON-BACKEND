'use strict';

const searchRepo = require('../repositories/search.repository');
const volunteerRepo = require('../repositories/volunteer.repository');
const bookmarkRepo = require('../repositories/bookmark.repository');
const { getPagination } = require('../utils/pagination');
const { toDateString, toIsoString } = require('../utils/date');

// S-01
async function search(userId, query) {
  const pagination = getPagination(query);
  const filters = {
    keyword: query.keyword,
    category: query.category,
    sidoCd: query.sidoCd,
    status: query.status,
    sort: 'latest',
  };
  const { items, totalCount } = await volunteerRepo.findList(filters, pagination);

  // 검색 기록 저장 (실패해도 검색 결과는 반환)
  try {
    await searchRepo.createHistory(userId, query.keyword);
  } catch (e) {
    // ignore history failure
  }

  const ids = items.map((v) => v.id);
  const bookmarked = await bookmarkRepo.findBookmarkedIds(userId, ids);
  const dtos = items.map((v) => ({
    id: v.id,
    title: v.title,
    categoryCode: v.categoryCode,
    actPlace: v.actPlace,
    startDate: toDateString(v.startDate),
    status: v.status,
    isBookmarked: bookmarked.has(v.id),
  }));
  return { keyword: query.keyword, items: dtos, totalCount };
}

// S-02 popular (public)
async function getPopular(limit = 10) {
  const rows = await searchRepo.findPopular(limit);
  return rows.map((k) => ({
    keyword: k.keyword,
    searchRank: k.searchRank,
    rankChange: k.rankChange,
    isNew: k.isNew,
  }));
}

// S-03 history
async function getHistory(userId, limit = 3) {
  const rows = await searchRepo.findHistory(userId, limit);
  return rows.map((h) => ({ id: h.id, keyword: h.keyword, searchedAt: toIsoString(h.searchedAt) }));
}

// S-04 delete history
async function deleteHistory(userId, id) {
  let result;
  if (id) result = await searchRepo.deleteHistoryById(userId, id);
  else result = await searchRepo.deleteAllHistory(userId);
  return { deletedCount: result.count };
}

module.exports = { search, getPopular, getHistory, deleteHistory };
