async function search(req, res, next) {
  try {
    // TODO: search_histories INSERT + getVolunteerList 호출
    const { keyword, sidoCd, gugunCd, srvcClCode, pageNo } = req.query;
    res.json({ message: 'TODO: 검색', keyword });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    // TODO: search_histories WHERE user_id = req.user.id ORDER BY searched_at DESC LIMIT 10
    res.json({ message: 'TODO: 최근 검색어', userId: req.user.id });
  } catch (err) {
    next(err);
  }
}

async function clearHistory(req, res, next) {
  try {
    // TODO: search_histories DELETE WHERE user_id = req.user.id
    res.json({ message: 'TODO: 검색 기록 삭제' });
  } catch (err) {
    next(err);
  }
}

async function getPopular(req, res, next) {
  try {
    // TODO: popular_searches WHERE base_date = TODAY ORDER BY rank ASC
    const { categoryCode } = req.query;
    res.json({ message: 'TODO: 인기 검색어', categoryCode: categoryCode || null });
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getHistory, clearHistory, getPopular };
