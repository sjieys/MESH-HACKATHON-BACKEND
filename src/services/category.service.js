'use strict';

const { CATEGORIES } = require('../constants/categories');

function getCategories() {
  return { items: CATEGORIES.map((c) => ({ code: c.code, name: c.name })) };
}

module.exports = { getCategories };
