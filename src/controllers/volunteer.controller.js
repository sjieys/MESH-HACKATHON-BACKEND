'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const volunteerService = require('../services/volunteer.service');
const recommendationService = require('../services/recommendation.service');
const userRepo = require('../repositories/user.repository');

const list = asyncHandler(async (req, res) => {
  const data = await volunteerService.getList(req.user.id, req.validatedQuery);
  sendSuccess(res, data);
});

const recommended = asyncHandler(async (req, res) => {
  const limit = req.validatedQuery.limit || 4;
  const data = await recommendationService.getRecommended(req.user.id, limit);
  sendSuccess(res, data);
});

const deadline = asyncHandler(async (req, res) => {
  const items = await volunteerService.getDeadline(req.user.id, req.validatedQuery);
  sendSuccess(res, { items });
});

const schedule = asyncHandler(async (req, res) => {
  const mbti = await userRepo.getMbti(req.user.id);
  const data = await volunteerService.getSchedule(req.user.id, req.validatedQuery, mbti ? mbti.day : null);
  sendSuccess(res, data);
});

const map = asyncHandler(async (req, res) => {
  const items = await volunteerService.getMap(req.user.id, req.validatedQuery);
  sendSuccess(res, { items });
});

const detail = asyncHandler(async (req, res) => {
  const data = await volunteerService.getDetail(req.user.id, req.validatedParams.id);
  sendSuccess(res, data);
});

module.exports = { list, recommended, deadline, schedule, map, detail };
