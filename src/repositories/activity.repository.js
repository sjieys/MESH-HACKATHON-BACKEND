'use strict';

const prisma = require('../libs/prisma');

async function findList(userId, filters, pagination) {
  const where = { userId };
  if (filters.status) where.status = filters.status;
  const [items, totalCount] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.activity.count({ where }),
  ]);
  return { items, totalCount };
}

function findByUserAndVolunteer(userId, volunteerId) {
  return prisma.activity.findUnique({
    where: { userId_volunteerId: { userId, volunteerId } },
  });
}

function createFromVolunteer(userId, volunteer, scheduledDate) {
  return prisma.activity.create({
    data: {
      userId,
      volunteerId: volunteer.id,
      title: volunteer.title,
      orgName: volunteer.orgName,
      categoryCode: volunteer.categoryCode,
      status: scheduledDate ? 'SCHEDULED' : 'PENDING',
      scheduledDate: scheduledDate || null,
    },
  });
}

function findOwnedById(userId, activityId) {
  return prisma.activity.findFirst({ where: { id: activityId, userId } });
}

function complete(activityId, hours) {
  return prisma.activity.update({
    where: { id: activityId },
    data: { status: 'COMPLETED', completedAt: new Date(), hours },
  });
}

function cancel(activityId) {
  return prisma.activity.update({
    where: { id: activityId },
    data: { status: 'CANCELLED' },
  });
}

// 통계: 누적 시간/완료 횟수/활동 기관 수/분야별
async function getStats(userId) {
  const completed = await prisma.activity.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { hours: true, orgName: true, categoryCode: true },
  });
  const totalHours = completed.reduce((s, a) => s + (a.hours != null ? Number(a.hours) : 0), 0);
  const completedCount = completed.length;
  const orgCount = new Set(completed.map((a) => a.orgName).filter(Boolean)).size;
  const byCategoryMap = {};
  completed.forEach((a) => {
    if (!a.categoryCode) return;
    byCategoryMap[a.categoryCode] = (byCategoryMap[a.categoryCode] || 0) + 1;
  });
  const byCategory = Object.entries(byCategoryMap).map(([categoryCode, count]) => ({ categoryCode, count }));
  return { totalHours: Math.round(totalHours * 10) / 10, completedCount, orgCount, byCategory };
}

module.exports = {
  findList,
  findByUserAndVolunteer,
  createFromVolunteer,
  findOwnedById,
  complete,
  cancel,
  getStats,
};
