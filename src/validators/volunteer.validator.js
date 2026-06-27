'use strict';

const { z } = require('zod');
const { numericQuery } = require('./common.validator');

const listQuery = z.object({
  category: z.string().optional(),
  sidoCd: numericQuery,
  gugunCd: numericQuery,
  status: z.enum(['RECRUITING', 'CLOSED']).optional(),
  keyword: z.string().max(100).optional(),
  sort: z.enum(['latest', 'deadline']).optional().default('latest'),
  page: numericQuery,
  size: numericQuery,
});

const recommendedQuery = z.object({
  limit: numericQuery,
});

const deadlineQuery = z.object({
  days: numericQuery,
  limit: numericQuery,
});

const scheduleQuery = z.object({
  timeSlot: z.enum(['WEEKDAY_MORNING', 'WEEKDAY_AFTERNOON', 'WEEKEND', 'ANY']).optional(),
  limit: numericQuery,
});

const mapQuery = z.object({
  lat: numericQuery,
  lng: numericQuery,
  radius: numericQuery,
  category: z.string().optional(),
});

module.exports = { listQuery, recommendedQuery, deadlineQuery, scheduleQuery, mapQuery };
