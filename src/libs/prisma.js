'use strict';

const { PrismaClient } = require('@prisma/client');

// 단일 PrismaClient 인스턴스 (hot-reload 시 중복 생성 방지)
const globalForPrisma = global;

const prisma =
  globalForPrisma.__prisma__ ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma__ = prisma;
}

module.exports = prisma;
