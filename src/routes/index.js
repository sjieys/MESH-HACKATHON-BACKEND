'use strict';

const express = require('express');
const router = express.Router();

router.use('/users', require('./user.routes'));
router.use('/volunteers', require('./volunteer.routes'));
router.use('/bookmarks', require('./bookmark.routes'));
router.use('/activities', require('./activity.routes'));
router.use('/search', require('./search.routes'));
router.use('/home', require('./home.routes'));
router.use('/categories', require('./category.routes'));
router.use('/regions', require('./region.routes'));

// 개발용 외부 수집 디버그 라우트 (production에서는 차단)
const env = require('../config/env');
if (!env.isProd) {
  router.use('/debug', require('./debug.routes'));
}

module.exports = router;
