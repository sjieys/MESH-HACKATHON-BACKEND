'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/region.controller');

// public
router.get('/', ctrl.list);

module.exports = router;
