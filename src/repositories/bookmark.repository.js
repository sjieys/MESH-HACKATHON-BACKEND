'use strict';

const prisma = require('../libs/prisma');

async function findList(userId, pagination) {
  const [rows, totalCount] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: { volunteer: true },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);
  return { rows, totalCount };
}

function exists(userId, volunteerId) {
  return prisma.bookmark.findUnique({
    where: { userId_volunteerId: { userId, volunteerId } },
  });
}

function create(userId, volunteerId) {
  return prisma.bookmark.create({ data: { userId, volunteerId } });
}

function remove(userId, volunteerId) {
  return prisma.bookmark.delete({
    where: { userId_volunteerId: { userId, volunteerId } },
  });
}

// 주어진 volunteerId 목록 중 사용자가 찜한 id set 반환
async function findBookmarkedIds(userId, volunteerIds) {
  if (!userId || !volunteerIds.length) return new Set();
  const rows = await prisma.bookmark.findMany({
    where: { userId, volunteerId: { in: volunteerIds } },
    select: { volunteerId: true },
  });
  return new Set(rows.map((r) => r.volunteerId));
}

module.exports = { findList, exists, create, remove, findBookmarkedIds };
