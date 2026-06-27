'use strict';

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const v = require('../validators/activity.validator');
const { idParam } = require('../validators/common.validator');
const ctrl = require('../controllers/activity.controller');

// /stats를 /:id 패턴보다 먼저
router.get('/stats', authRequired, ctrl.stats);
router.get('/', authRequired, validate({ query: v.listQuery }), ctrl.list);
router.post('/', authRequired, validate({ body: v.createBody }), ctrl.create);
router.put('/:id/complete', authRequired, validate({ params: idParam, body: v.completeBody }), ctrl.complete);
router.post('/:id/cancel', authRequired, validate({ params: idParam }), ctrl.cancel);

module.exports = router;
