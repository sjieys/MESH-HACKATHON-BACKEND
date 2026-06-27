'use strict';

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createBody } = require('../validators/bookmark.validator');
const { volunteerIdParam } = require('../validators/common.validator');
const ctrl = require('../controllers/bookmark.controller');

router.get('/', authRequired, ctrl.list);
router.post('/', authRequired, validate({ body: createBody }), ctrl.add);
router.delete('/:volunteerId', authRequired, validate({ params: volunteerIdParam }), ctrl.remove);

module.exports = router;
