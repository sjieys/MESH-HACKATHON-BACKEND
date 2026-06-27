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

router.use('/debug', require('./debug.routes'));

module.exports = router;
