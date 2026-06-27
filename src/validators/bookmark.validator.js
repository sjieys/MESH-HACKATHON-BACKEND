'use strict';

const { z } = require('zod');

const createBody = z.object({
  volunteerId: z.number({ required_error: 'volunteerId는 필수예요' }).int().positive('유효한 봉사 ID가 아니에요'),
});

module.exports = { createBody };
