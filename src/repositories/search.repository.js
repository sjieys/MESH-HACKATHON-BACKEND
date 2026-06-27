'use strict';

const prisma = require('../libs/prisma');

function createHistory(userId, keyword) {
  return prisma.searchHistory.create({ data: { userId, keyword } });
}

function findHistory(userId, limit = 3) {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { searchedAt: 'desc' },
    take: limit,
  });
}

function deleteHistoryById(userId, id) {
  return prisma.searchHistory.deleteMany({ where: { userId, id } });
}

function deleteAllHistory(userId) {
  return prisma.searchHistory.deleteMany({ where: { userId } });
}

function findPopular(limit = 10) {
  return prisma.popularKeyword.findMany({
    orderBy: { searchRank: 'asc' },
    take: limit,
  });
}

module.exports = {
  createHistory,
  findHistory,
  deleteHistoryById,
  deleteAllHistory,
  findPopular,
};
