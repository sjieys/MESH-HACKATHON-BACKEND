'use strict';

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const v = require('../validators/volunteer.validator');
const { idParam } = require('../validators/common.validator');
const ctrl = require('../controllers/volunteer.controller');

// 정적 라우트를 :id보다 먼저 등록
router.get('/recommended', authRequired, validate({ query: v.recommendedQuery }), ctrl.recommended);
router.get('/deadline', authRequired, validate({ query: v.deadlineQuery }), ctrl.deadline);
router.get('/schedule', authRequired, validate({ query: v.scheduleQuery }), ctrl.schedule);
router.get('/map', authRequired, validate({ query: v.mapQuery }), ctrl.map);
router.get('/', authRequired, validate({ query: v.listQuery }), ctrl.list);
router.get('/:id', authRequired, validate({ params: idParam }), ctrl.detail);

module.exports = router;
