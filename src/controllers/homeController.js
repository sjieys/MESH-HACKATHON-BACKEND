const { getVolunteerList } = require('../services/api1365Service');

// GET /api/home
async function getHome(req, res, next) {
  try {
    // TODO: 로그인 유저면 MBTI 조회 후 srvcClCode 매핑, 비로그인이면 기본 추천
    // TODO: user regionCode 기반으로 sidoCd 필터링
    const [recommended, nearby] = await Promise.all([
      getVolunteerList({ numOfRows: 6 }),
      getVolunteerList({ numOfRows: 4 }),
    ]);

    res.json({
      mbtiType: req.user ? 'TODO: DB에서 조회' : null,
      recommended: recommended.items || [],
      nearby: nearby.items || [],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHome };
