'use strict';

const dayjs = require('dayjs');

// Date 객체 -> 'YYYY-MM-DD'
function toDateString(value) {
  if (!value) return null;
  return dayjs(value).format('YYYY-MM-DD');
}

// Date(@db.Time) 객체 -> 'HH:mm'
function toTimeString(value) {
  if (!value) return null;
  return dayjs(value).format('HH:mm');
}

// Date 객체 -> ISO string
function toIsoString(value) {
  if (!value) return null;
  return dayjs(value).toISOString();
}

// 'YYYY-MM-DD' 또는 'YYYYMMDD' -> Date(자정 UTC) 또는 null
function parseDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  let normalized = str;
  if (/^\d{8}$/.test(str)) {
    normalized = `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  const d = dayjs(normalized);
  return d.isValid() ? d.toDate() : null;
}

// '10', '1000', '10:00' 등 -> Date(1970-01-01THH:mm) 또는 null
function parseTime(value) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  let hh;
  let mm = '00';
  if (str.includes(':')) {
    const [h, m] = str.split(':');
    hh = h.padStart(2, '0');
    mm = (m || '00').padStart(2, '0');
  } else if (/^\d{3,4}$/.test(str)) {
    hh = str.slice(0, str.length - 2).padStart(2, '0');
    mm = str.slice(-2);
  } else if (/^\d{1,2}$/.test(str)) {
    hh = str.padStart(2, '0');
  } else {
    return null;
  }
  const d = dayjs(`1970-01-01 ${hh}:${mm}`, 'YYYY-MM-DD HH:mm');
  return d.isValid() ? d.toDate() : null;
}

// noticeEndDate 기준 D-Day 계산 (오늘 마감=0, 지남=음수)
function calcDDay(noticeEndDate) {
  if (!noticeEndDate) return null;
  const end = dayjs(noticeEndDate).startOf('day');
  const today = dayjs().startOf('day');
  return end.diff(today, 'day');
}

// 두 시간(Date)으로 인정 시간(숫자) 계산
function calcHours(beginTime, endTime) {
  if (!beginTime || !endTime) return null;
  const diff = dayjs(endTime).diff(dayjs(beginTime), 'minute');
  if (Number.isNaN(diff) || diff <= 0) return null;
  return Math.round((diff / 60) * 10) / 10;
}

module.exports = {
  toDateString,
  toTimeString,
  toIsoString,
  parseDate,
  parseTime,
  calcDDay,
  calcHours,
};
