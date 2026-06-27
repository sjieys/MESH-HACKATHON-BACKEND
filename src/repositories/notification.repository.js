'use strict';

const prisma = require('../libs/prisma');

function findList(userId, pagination) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: pagination ? pagination.skip : undefined,
    take: pagination ? pagination.take : undefined,
  });
}

function create(userId, { type, title, body }) {
  return prisma.notification.create({ data: { userId, type, title, body } });
}

function markRead(userId, id) {
  return prisma.notification.updateMany({ where: { userId, id }, data: { isRead: true } });
}

function getSetting(userId) {
  return prisma.notificationSetting.findUnique({ where: { userId } });
}

function upsertSetting(userId, data) {
  return prisma.notificationSetting.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data },
  });
}

module.exports = { findList, create, markRead, getSetting, upsertSetting };
