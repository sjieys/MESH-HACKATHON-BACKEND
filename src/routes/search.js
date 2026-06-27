const { Router } = require('express');
const auth = require('../middlewares/auth');
const { search, getHistory, clearHistory, getPopular } = require('../controllers/searchController');

const router = Router();

router.get('/', search);
router.get('/popular', getPopular);
router.get('/history', auth, getHistory);
router.delete('/history', auth, clearHistory);

module.exports = router;
