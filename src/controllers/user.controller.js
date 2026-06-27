'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const userService = require('../services/user.service');

const socialLogin = asyncHandler(async (req, res) => {
  const data = await userService.socialLogin(req.body);
  sendSuccess(res, data, data.isNewUser ? 201 : 200);
});

const onboarding = asyncHandler(async (req, res) => {
  const data = await userService.onboarding(req.user.id, req.body);
  sendSuccess(res, data);
});

const getMyPage = asyncHandler(async (req, res) => {
  const data = await userService.getMyPage(req.user.id);
  sendSuccess(res, data);
});

const updateMe = asyncHandler(async (req, res) => {
  const data = await userService.updateMe(req.user.id, req.body);
  sendSuccess(res, data);
});

const logout = asyncHandler(async (req, res) => {
  const data = await userService.logout(req.user.id);
  sendSuccess(res, data);
});

module.exports = { socialLogin, onboarding, getMyPage, updateMe, logout };
