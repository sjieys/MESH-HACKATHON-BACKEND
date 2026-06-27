'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/response');
const bookmarkService = require('../services/bookmark.service');

const list = asyncHandler(async (req, res) => {
  const data = await bookmarkService.getList(req.user.id, req.validatedQuery || req.query);
  sendSuccess(res, data);
});

const add = asyncHandler(async (req, res) => {
  const data = await bookmarkService.add(req.user.id, req.body.volunteerId);
  sendCreated(res, data);
});

const remove = asyncHandler(async (req, res) => {
  const data = await bookmarkService.remove(req.user.id, req.validatedParams.volunteerId);
  sendSuccess(res, data);
});

module.exports = { list, add, remove };
