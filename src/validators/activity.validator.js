'use strict';

const { z } = require('zod');
const { numericQuery } = require('./common.validator');

const listQuery = z.object({
  status: z.enum(['pending', 'scheduled', 'completed', 'cancelled']).optional(),
  page: numericQuery,
  size: numericQuery,
});

const createBody = z.object({
  volunteerId: z.number({ required_error: 'volunteerId는 필수예요' }).int().positive(),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 해요')
    .optional(),
});

const completeBody = z.object({
  hours: z.number().positive('활동 시간은 0보다 커야 해요').optional(),
});

module.exports = { listQuery, createBody, completeBody };
