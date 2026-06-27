const { Router } = require('express');
const { getRegions } = require('../controllers/regionsController');

const router = Router();

router.get('/', getRegions);

module.exports = router;
