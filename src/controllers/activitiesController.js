// GET /api/activities
async function getActivities(req, res, next) {
  try {
    // TODO: user_activities WHERE user_id = req.user.id
    // status query: 'pending'(신청한 봉사) | 'completed'(완료한 봉사) | 'history'(활동 이력)
    const { status, pageNo = 1 } = req.query;
    res.json({ message: 'TODO: 내 활동 목록', status, pageNo });
  } catch (err) {
    next(err);
  }
}

// POST /api/activities
async function createActivity(req, res, next) {
  try {
    // TODO: user_activities INSERT (봉사 신청 기록)
    const { volunteerId, scheduledDate } = req.body;
    res.status(201).json({ message: 'TODO: 활동 신청 기록', volunteerId, scheduledDate });
  } catch (err) {
    next(err);
  }
}

// PUT /api/activities/:id/complete
async function completeActivity(req, res, next) {
  try {
    // TODO: user_activities UPDATE status='completed', completed_at=NOW()
    const { id } = req.params;
    res.json({ message: 'TODO: 활동 완료 처리', id });
  } catch (err) {
    next(err);
  }
}

// GET /api/activities/stats
async function getStats(req, res, next) {
  try {
    // TODO: 누적 봉사 횟수, 활동 시간 합산, 활동 기관 수, 뱃지 진행도, 카테고리별 통계
    res.json({
      message: 'TODO: 활동 통계',
      totalCount: 0,
      totalHours: 0,
      totalOrgs: 0,
      nextBadge: { name: '골드 봉사자', required: 20, current: 12 },
      categoryStats: [],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getActivities, createActivity, completeActivity, getStats };
