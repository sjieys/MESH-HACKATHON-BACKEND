'use strict';

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const v = require('../validators/search.validator');
const ctrl = require('../controllers/search.controller');

// /popular는 public (인증 불필요)
router.get('/popular', validate({ query: v.popularQuery }), ctrl.popular);
router.get('/history', authRequired, validate({ query: v.historyQuery }), ctrl.history);
router.delete('/history', authRequired, validate({ query: v.deleteHistoryQuery }), ctrl.deleteHistory);
router.get('/', authRequired, validate({ query: v.searchQuery }), ctrl.search);

module.exports = router;
