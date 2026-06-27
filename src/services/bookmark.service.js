'use strict';

const bookmarkRepo = require('../repositories/bookmark.repository');
const volunteerRepo = require('../repositories/volunteer.repository');
const { getPagination } = require('../utils/pagination');
const { toDateString, toIsoString } = require('../utils/date');
const AppError = require('../utils/AppError');

// B-01
async function getList(userId, query) {
  const pagination = getPagination(query);
  const { rows, totalCount } = await bookmarkRepo.findList(userId, pagination);
  const items = rows.map((b) => ({
    volunteerId: b.volunteerId,
    title: b.volunteer.title,
    categoryCode: b.volunteer.categoryCode,
    actPlace: b.volunteer.actPlace,
    startDate: toDateString(b.volunteer.startDate),
    status: b.volunteer.status,
    bookmarkedAt: toIsoString(b.createdAt),
  }));
  return { items, totalCount };
}

// B-02
async function add(userId, volunteerId) {
  const volunteer = await volunteerRepo.findById(volunteerId);
  if (!volunteer) throw AppError.notFound('봉사 정보를 찾을 수 없어요');
  const existing = await bookmarkRepo.exists(userId, volunteerId);
  if (existing) throw AppError.conflict('이미 찜한 봉사예요');
  await bookmarkRepo.create(userId, volunteerId);
  return { volunteerId, isBookmarked: true };
}

// B-03
async function remove(userId, volunteerId) {
  const existing = await bookmarkRepo.exists(userId, volunteerId);
  if (!existing) throw AppError.notFound('찜한 봉사가 아니에요');
  await bookmarkRepo.remove(userId, volunteerId);
  return { volunteerId, isBookmarked: false };
}

module.exports = { getList, add, remove };
