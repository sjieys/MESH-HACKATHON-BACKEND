'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const homeService = require('../services/home.service');

const home = asyncHandler(async (req, res) => {
  const data = await homeService.getHome(req.user.id);
  sendSuccess(res, data);
});

module.exports = { home };
