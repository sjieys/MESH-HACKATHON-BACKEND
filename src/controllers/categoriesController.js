async function getCategories(req, res, next) {
  try {
    // TODO: categories 테이블 전체 조회
    res.json({ message: 'TODO: 카테고리 목록' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories };
