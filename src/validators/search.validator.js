'use strict';

const { z } = require('zod');
const { numericQuery } = require('./common.validator');

const searchQuery = z.object({
  keyword: z.string({ required_error: '검색어를 입력해 주세요' }).trim().min(1, '검색어를 입력해 주세요').max(100, '검색어는 100자 이하예요'),
  category: z.string().optional(),
  sidoCd: numericQuery,
  status: z.enum(['RECRUITING', 'CLOSED']).optional(),
  page: numericQuery,
  size: numericQuery,
});

const popularQuery = z.object({
  limit: numericQuery,
});

const historyQuery = z.object({
  limit: numericQuery,
});

const deleteHistoryQuery = z.object({
  id: numericQuery,
});

module.exports = { searchQuery, popularQuery, historyQuery, deleteHistoryQuery };
