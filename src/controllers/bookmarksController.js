async function getBookmarks(req, res, next) {
  try {
    // TODO: bookmarks JOIN volunteers WHERE user_id = req.user.id
    res.json({ message: 'TODO: 찜 목록', userId: req.user.id });
  } catch (err) {
    next(err);
  }
}

async function addBookmark(req, res, next) {
  try {
    // TODO: bookmarks INSERT (중복이면 409)
    const { volunteerId } = req.body;
    res.status(201).json({ message: 'TODO: 찜 추가', volunteerId });
  } catch (err) {
    next(err);
  }
}

async function removeBookmark(req, res, next) {
  try {
    // TODO: bookmarks DELETE WHERE user_id = req.user.id AND volunteer_id = req.params.volunteerId
    const { volunteerId } = req.params;
    res.json({ message: 'TODO: 찜 취소', volunteerId });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBookmarks, addBookmark, removeBookmark };
