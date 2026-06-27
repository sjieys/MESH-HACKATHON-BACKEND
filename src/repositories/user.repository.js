'use strict';

const prisma = require('../libs/prisma');

function findById(userId) {
  return prisma.user.findUnique({ where: { id: userId } });
}

function findByEmail(email) {
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

function findByProvider(provider, providerId) {
  return prisma.user.findUnique({
    where: { provider_providerId: { provider, providerId } },
  });
}

function createSocialUser(data) {
  return prisma.user.create({ data });
}

function updateUser(userId, data) {
  return prisma.user.update({ where: { id: userId }, data });
}

function updateLastLogin(userId) {
  return prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
}

function getMbti(userId) {
  return prisma.volunteerMbti.findUnique({ where: { userId } });
}

function getInterests(userId) {
  return prisma.userInterest.findMany({ where: { userId } });
}

// onboarding: volunteer_mbti upsert (transaction client tx 사용 가능)
function upsertOnboarding(userId, data, client = prisma) {
  return client.volunteerMbti.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data },
  });
}

// user_interests 전체 교체
async function replaceUserInterests(userId, interests, client = prisma) {
  await client.userInterest.deleteMany({ where: { userId } });
  if (!interests || interests.length === 0) return [];
  await client.userInterest.createMany({
    data: interests.map((categoryCode) => ({ userId, categoryCode })),
    skipDuplicates: true,
  });
  return client.userInterest.findMany({ where: { userId } });
}

// 마이페이지 집계
async function getMyPage(userId) {
  const [user, mbti, interests, bookmarkCount, completedAgg] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.volunteerMbti.findUnique({ where: { userId } }),
    prisma.userInterest.findMany({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } }),
    prisma.activity.aggregate({
      where: { userId, status: 'COMPLETED' },
      _count: { _all: true },
      _sum: { hours: true },
    }),
  ]);
  return {
    user,
    mbti,
    interests,
    bookmarkCount,
    completedCount: completedAgg._count._all,
    totalHours: completedAgg._sum.hours != null ? Number(completedAgg._sum.hours) : 0,
  };
}

module.exports = {
  findById,
  findByEmail,
  findByProvider,
  createSocialUser,
  updateUser,
  updateLastLogin,
  getMbti,
  getInterests,
  upsertOnboarding,
  replaceUserInterests,
  getMyPage,
};
