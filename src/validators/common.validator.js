'use strict';

const { z } = require('zod');

// query string 숫자 -> number (없으면 undefined, NaN이면 에러)
const numericQuery = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v === '' ? undefined : Number(v)))
  .refine((v) => v === undefined || !Number.isNaN(v), { message: '숫자 형식이 아니에요' });

const requiredNumericQuery = z
  .string({ required_error: '필수 값이에요' })
  .transform((v) => Number(v))
  .refine((v) => !Number.isNaN(v), { message: '숫자 형식이 아니에요' });

// path param :id 등 양의 정수
const idParam = z.object({
  id: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, { message: '유효한 ID가 아니에요' }),
});

const volunteerIdParam = z.object({
  volunteerId: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, { message: '유효한 봉사 ID가 아니에요' }),
});

const paginationQuery = {
  page: numericQuery,
  size: numericQuery,
};

module.exports = {
  numericQuery,
  requiredNumericQuery,
  idParam,
  volunteerIdParam,
  paginationQuery,
};
