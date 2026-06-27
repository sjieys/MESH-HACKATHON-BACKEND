'use strict';

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/home.controller');

router.get('/', authRequired, ctrl.home);

module.exports = router;
