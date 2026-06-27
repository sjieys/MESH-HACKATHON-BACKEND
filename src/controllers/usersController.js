const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function signup(req, res, next) {
  try {
    const { name, email, password, ageGroup, regionCode } = req.body;
    res.status(201).json({ message: 'TODO: 회원가입' });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    res.json({ message: 'TODO: 로그인', token: 'TODO' });
  } catch (err) { next(err); }
}

async function socialLogin(req, res, next) {
  try {
    const { provider, providerToken } = req.body;
    res.json({ message: 'TODO: 소셜 로그인', provider });
  } catch (err) { next(err); }
}

async function getMe(req, res, next) {
  try {
    res.json({ message: 'TODO: 내 정보', userId: req.user.id });
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    res.json({ message: 'TODO: 내 정보 수정' });
  } catch (err) { next(err); }
}

async function saveMbti(req, res, next) {
  try {
    const { mbtiType, activityStyle, frequency, availableDays, preferredRegion } = req.body;
    res.status(201).json({ message: 'TODO: MBTI 저장' });
  } catch (err) { next(err); }
}

async function getMbti(req, res, next) {
  try {
    res.json({ message: 'TODO: MBTI 조회', userId: req.user.id });
  } catch (err) { next(err); }
}

async function getMbtiResult(req, res, next) {
  try {
    // TODO: volunteer_mbti 조회 후 mbtiType → 설명/키워드/추천카테고리 매핑
    res.json({
      message: 'TODO: MBTI 결과 상세',
      mbtiType: '그린메이커형',
      color: 'GREEN',
      description: '말보다 행동이 먼저인 세상을 바꾸는 실행가',
      keywords: ['#실행력', '#야외 활동', '#체험형'],
      recommendedCategories: ['환경·생태', '동물보호', '지역사회'],
    });
  } catch (err) { next(err); }
}

module.exports = { signup, login, socialLogin, getMe, updateMe, saveMbti, getMbti, getMbtiResult };
