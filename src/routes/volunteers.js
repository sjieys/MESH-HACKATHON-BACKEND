const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getList, getRecommended, getDeadline, getBySchedule, getMap, getDetail } = require('../controllers/volunteersController');

const router = Router();

router.get('/', getList);
router.get('/recommended', auth, getRecommended);
router.get('/deadline', getDeadline);
router.get('/schedule', auth, getBySchedule);
router.get('/map', getMap);
router.get('/:id', getDetail);

module.exports = router;
