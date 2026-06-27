const { Router } = require('express');
const auth = require('../middlewares/auth');
const { signup, login, socialLogin, getMe, updateMe, saveMbti, getMbti, getMbtiResult } = require('../controllers/usersController');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/social-login', socialLogin);
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/mbti/result', auth, getMbtiResult);
router.post('/mbti', auth, saveMbti);
router.get('/mbti', auth, getMbti);

module.exports = router;
