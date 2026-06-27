'use strict';

const prisma = require('../libs/prisma');

function buildWhere(filters = {}) {
  const where = {};
  if (filters.category) where.categoryCode = filters.category;
  if (filters.sidoCd) where.sidoCd = filters.sidoCd;
  if (filters.gugunCd) where.gugunCd = filters.gugunCd;
  if (filters.status) where.status = filters.status;
  if (filters.keyword) where.title = { contains: filters.keyword };
  return where;
}

async function findList(filters, pagination) {
  const where = buildWhere(filters);
  const orderBy = filters.sort === 'deadline' ? { noticeEndDate: 'asc' } : { createdAt: 'desc' };
  const [items, totalCount] = await Promise.all([
    prisma.volunteer.findMany({ where, orderBy, skip: pagination.skip, take: pagination.take }),
    prisma.volunteer.count({ where }),
  ]);
  return { items, totalCount };
}

function findById(id) {
  return prisma.volunteer.findUnique({ where: { id } });
}

function findManyByIds(ids) {
  return prisma.volunteer.findMany({ where: { id: { in: ids } } });
}

// 추천 후보: 모집중 위주, 넉넉히 가져와 서비스에서 점수 계산
function findRecommendedCandidates({ categoryCodes = [], sidoCd, take = 100 }) {
  const where = { status: 'RECRUITING' };
  const or = [];
  if (categoryCodes.length) or.push({ categoryCode: { in: categoryCodes } });
  if (sidoCd) or.push({ sidoCd });
  if (or.length) where.OR = or;
  return prisma.volunteer.findMany({ where, take, orderBy: { noticeEndDate: 'asc' } });
}

function findDeadline(fromDate, toDate, take) {
  return prisma.volunteer.findMany({
    where: {
      status: 'RECRUITING',
      noticeEndDate: { gte: fromDate, lte: toDate },
    },
    orderBy: { noticeEndDate: 'asc' },
    take,
  });
}

function findBySchedule({ wkdyList = [], requireTime = false, take = 50 }) {
  const where = { status: 'RECRUITING' };
  if (requireTime) where.actBeginTime = { not: null };
  if (wkdyList.length) {
    where.OR = wkdyList.map((w) => ({ actWkdy: { contains: w } }));
  }
  return prisma.volunteer.findMany({ where, take, orderBy: { noticeEndDate: 'asc' } });
}

function findMapCandidates(filters = {}, take = 300) {
  const where = { latitude: { not: null }, longitude: { not: null } };
  if (filters.category) where.categoryCode = filters.category;
  return prisma.volunteer.findMany({ where, take });
}

function upsertFromSource(data) {
  const { source, sourceId, ...rest } = data;
  return prisma.volunteer.upsert({
    where: { source_sourceId: { source, sourceId } },
    create: { source, sourceId, ...rest },
    update: { ...rest },
  });
}

module.exports = {
  buildWhere,
  findList,
  findById,
  findManyByIds,
  findRecommendedCandidates,
  findDeadline,
  findBySchedule,
  findMapCandidates,
  upsertFromSource,
};
