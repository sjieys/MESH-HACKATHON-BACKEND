'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const searchService = require('../services/search.service');

const search = asyncHandler(async (req, res) => {
  const data = await searchService.search(req.user.id, req.validatedQuery);
  sendSuccess(res, data);
});

const popular = asyncHandler(async (req, res) => {
  const limit = (req.validatedQuery && req.validatedQuery.limit) || 10;
  const items = await searchService.getPopular(limit);
  sendSuccess(res, { items });
});

const history = asyncHandler(async (req, res) => {
  const limit = (req.validatedQuery && req.validatedQuery.limit) || 3;
  const items = await searchService.getHistory(req.user.id, limit);
  sendSuccess(res, { items });
});

const deleteHistory = asyncHandler(async (req, res) => {
  const id = req.validatedQuery ? req.validatedQuery.id : undefined;
  const data = await searchService.deleteHistory(req.user.id, id);
  sendSuccess(res, data);
});

module.exports = { search, popular, history, deleteHistory };
