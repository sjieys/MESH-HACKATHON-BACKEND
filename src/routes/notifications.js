const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getNotifications, readNotification } = require('../controllers/notificationsController');

const router = Router();

router.use(auth);

router.get('/', getNotifications);
router.put('/:id/read', readNotification);

module.exports = router;
