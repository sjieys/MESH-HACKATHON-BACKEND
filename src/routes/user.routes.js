'use strict';

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const v = require('../validators/user.validator');
const ctrl = require('../controllers/user.controller');

router.post('/social-login', validate({ body: v.socialLoginBody }), ctrl.socialLogin);
router.post('/onboarding', authRequired, validate({ body: v.onboardingBody }), ctrl.onboarding);
router.get('/mypage', authRequired, ctrl.getMyPage);
router.put('/me', authRequired, validate({ body: v.updateMeBody }), ctrl.updateMe);
router.post('/logout', authRequired, ctrl.logout);

module.exports = router;
