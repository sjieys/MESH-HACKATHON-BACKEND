// GET /api/notifications
async function getNotifications(req, res, next) {
  try {
    // TODO: notifications WHERE user_id = req.user.id ORDER BY created_at DESC
    res.json({ message: 'TODO: 알림 목록', userId: req.user.id });
  } catch (err) {
    next(err);
  }
}

// PUT /api/notifications/:id/read
async function readNotification(req, res, next) {
  try {
    // TODO: notifications UPDATE is_read=true WHERE id = req.params.id AND user_id = req.user.id
    const { id } = req.params;
    res.json({ message: 'TODO: 알림 읽음 처리', id });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, readNotification };
