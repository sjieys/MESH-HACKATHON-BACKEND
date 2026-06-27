const { Router } = require('express');
const { getCategories } = require('../controllers/categoriesController');

const router = Router();

router.get('/', getCategories);

module.exports = router;
