'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/response');
const activityService = require('../services/activity.service');

const list = asyncHandler(async (req, res) => {
  const data = await activityService.getList(req.user.id, req.validatedQuery);
  sendSuccess(res, data);
});

const create = asyncHandler(async (req, res) => {
  const data = await activityService.create(req.user.id, req.body);
  sendCreated(res, data);
});

const complete = asyncHandler(async (req, res) => {
  const data = await activityService.complete(req.user.id, req.validatedParams.id, req.body.hours);
  sendSuccess(res, data);
});

const cancel = asyncHandler(async (req, res) => {
  const data = await activityService.cancel(req.user.id, req.validatedParams.id);
  sendSuccess(res, data);
});

const stats = asyncHandler(async (req, res) => {
  const data = await activityService.getStats(req.user.id);
  sendSuccess(res, data);
});

module.exports = { list, create, complete, cancel, stats };
