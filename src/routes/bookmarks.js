const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarksController');

const router = Router();

router.use(auth);

router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:volunteerId', removeBookmark);

module.exports = router;
