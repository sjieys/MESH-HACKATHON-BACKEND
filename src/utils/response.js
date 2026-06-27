'use strict';

function sendSuccess(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function sendCreated(res, data = {}) {
  return res.status(201).json({ success: true, data });
}

function sendNoContent(res) {
  return res.status(204).send();
}

module.exports = { sendSuccess, sendCreated, sendNoContent };
