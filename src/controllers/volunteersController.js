const { getVolunteerList, getVolunteerDetail } = require('../services/api1365Service');

// GET /api/volunteers
async function getList(req, res, next) {
  try {
    const { keyword, sidoCd, gugunCd, srvcClCode, pageNo, numOfRows } = req.query;
    const result = await getVolunteerList({ keyword, sidoCd, gugunCd, srvcClCode, pageNo, numOfRows });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/volunteers/recommended
async function getRecommended(req, res, next) {
  try {
    // TODO: user MBTI → srvcClCode 매핑 후 조회
    res.json({ message: 'TODO: MBTI 기반 추천' });
  } catch (err) {
    next(err);
  }
}

// GET /api/volunteers/deadline
async function getDeadline(req, res, next) {
  try {
    // TODO: noticeEndde 기준 D-3 이내 필터링
    res.json({ message: 'TODO: 마감 임박 공고' });
  } catch (err) {
    next(err);
  }
}

// GET /api/volunteers/schedule
async function getBySchedule(req, res, next) {
  try {
    // TODO: actBeginTm/actEndTm + actWkdy 기준 사용자 가용 시간 매칭
    const { availableDays, beginTm, endTm } = req.query;
    res.json({ message: 'TODO: 시간 기반 매칭', params: { availableDays, beginTm, endTm } });
  } catch (err) {
    next(err);
  }
}

// GET /api/volunteers/map
async function getMap(req, res, next) {
  try {
    // TODO: sidoCd/gugunCd 기반 목록 조회 → 구군 코드로 클러스터링
    const { sidoCd, gugunCd, srvcClCode } = req.query;
    const result = await getVolunteerList({ sidoCd, gugunCd, srvcClCode, numOfRows: 50 });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/volunteers/:id
async function getDetail(req, res, next) {
  try {
    const { id } = req.params;
    const result = await getVolunteerDetail(id);
    // TODO: 로그인 유저면 MBTI 매칭 점수 계산 후 matchScore 필드 추가
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getList, getRecommended, getDeadline, getBySchedule, getMap, getDetail };
