const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getActivities, createActivity, completeActivity, getStats } = require('../controllers/activitiesController');

const router = Router();

router.use(auth);

router.get('/stats', getStats);
router.get('/', getActivities);
router.post('/', createActivity);
router.put('/:id/complete', completeActivity);

module.exports = router;
