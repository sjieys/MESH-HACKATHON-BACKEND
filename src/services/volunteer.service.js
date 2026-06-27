'use strict';

const volunteerRepo = require('../repositories/volunteer.repository');
const bookmarkRepo = require('../repositories/bookmark.repository');
const { getPagination, buildPageResult } = require('../utils/pagination');
const { toCardDto, toDetailDto, toMapDto } = require('../mappers/volunteer.mapper');
const { isValidSido } = require('../constants/regions');
const AppError = require('../utils/AppError');
const dayjs = require('dayjs');

async function attachBookmark(items, userId) {
  const ids = items.map((v) => v.id);
  const bookmarked = await bookmarkRepo.findBookmarkedIds(userId, ids);
  return { bookmarked };
}

// V-01 목록
async function getList(userId, query) {
  const pagination = getPagination(query);
  const filters = {
    category: query.category,
    sidoCd: query.sidoCd,
    gugunCd: query.gugunCd,
    status: query.status,
    keyword: query.keyword,
    sort: query.sort || 'latest',
  };
  const { items, totalCount } = await volunteerRepo.findList(filters, pagination);
  const { bookmarked } = await attachBookmark(items, userId);
  const dtos = items.map((v) => toCardDto(v, bookmarked.has(v.id)));
  return buildPageResult(dtos, totalCount, pagination.page, pagination.size);
}

// V-03 마감 임박
async function getDeadline(userId, query) {
  const days = query.days || 3;
  const limit = query.limit || 10;
  const from = dayjs().startOf('day').toDate();
  const to = dayjs().add(days, 'day').endOf('day').toDate();
  const items = await volunteerRepo.findDeadline(from, to, limit);
  const { bookmarked } = await attachBookmark(items, userId);
  return items.map((v) => {
    const card = toCardDto(v, bookmarked.has(v.id));
    return { ...card, daysLeft: card.dDay };
  });
}

// V-04 시간 기반 매칭
async function getSchedule(userId, query, userDay) {
  const limit = query.limit || 10;
  const day = query.timeSlot || userDay || 'ANY';
  let wkdyList = [];
  let requireTime = false;
  if (day === 'WEEKEND') {
    wkdyList = ['토', '일', '주말'];
  } else if (day === 'WEEKDAY_MORNING' || day === 'WEEKDAY_AFTERNOON') {
    wkdyList = ['월', '화', '수', '목', '금', '평일'];
    requireTime = true;
  }
  const items = await volunteerRepo.findBySchedule({ wkdyList, requireTime, take: limit });
  const { bookmarked } = await attachBookmark(items, userId);
  return {
    timeSlot: day,
    items: items.map((v) => toCardDto(v, bookmarked.has(v.id))),
  };
}

// V-05 지도용
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getMap(userId, query) {
  const { lat, lng, radius, category } = query;
  if ((lat != null && lng == null) || (lat == null && lng != null)) {
    throw AppError.badRequest('위치 정보를 확인해 주세요');
  }
  const candidates = await volunteerRepo.findMapCandidates({ category }, 300);
  let result = candidates.map((v) => {
    let distance = null;
    if (lat != null && lng != null && v.latitude != null && v.longitude != null) {
      distance = haversine(lat, lng, Number(v.latitude), Number(v.longitude));
    }
    return { v, distance };
  });
  if (lat != null && lng != null) {
    const r = radius || 5;
    result = result
      .filter((x) => x.distance != null && x.distance <= r)
      .sort((a, b) => a.distance - b.distance);
  }
  return result.map((x) => toMapDto(x.v, x.distance));
}

// V-06 상세
async function getDetail(userId, id) {
  const volunteer = await volunteerRepo.findById(id);
  if (!volunteer) throw AppError.notFound('봉사 정보를 찾을 수 없어요');
  const bookmark = userId ? await bookmarkRepo.exists(userId, id) : null;
  return toDetailDto(volunteer, !!bookmark);
}

module.exports = { getList, getDeadline, getSchedule, getMap, getDetail, attachBookmark };
