'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const categoryService = require('../services/category.service');

const list = asyncHandler(async (req, res) => {
  sendSuccess(res, categoryService.getCategories());
});

module.exports = { list };
