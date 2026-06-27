'use strict';

const { toDateString, toTimeString, toIsoString, calcDDay, calcHours } = require('../utils/date');
const { getCategoryName } = require('../constants/categories');

// Prisma Volunteer source enum -> Android 표시값
function sourceToAndroid(source) {
  return source === 'API_1365' ? '1365' : 'VMS';
}

// 내부 status -> 한국어 표시 텍스트
function statusToText(status) {
  switch (status) {
    case 'RECRUITING':
      return '모집중';
    case 'CLOSED':
      return '마감';
    default:
      return '상태미정';
  }
}

function recruitProgress(current, total) {
  if (!total || total <= 0) return 0;
  return Math.round(((current || 0) / total) * 100);
}

function actTimeText(beginTime, endTime) {
  const b = toTimeString(beginTime);
  const e = toTimeString(endTime);
  if (b && e) return `${b}~${e}`;
  if (b) return b;
  return null;
}

// Android 봉사 카드 공통 DTO
function toCardDto(volunteer, isBookmarked = false) {
  if (!volunteer) return null;
  const current = volunteer.applyTotal;
  const total = volunteer.recruitNum;
  return {
    id: volunteer.id,
    source: sourceToAndroid(volunteer.source),
    status: volunteer.status,
    statusText: statusToText(volunteer.status),
    categoryCode: volunteer.categoryCode,
    categoryName: getCategoryName(volunteer.categoryCode) || null,
    dDay: calcDDay(volunteer.noticeEndDate),
    title: volunteer.title,
    orgName: volunteer.orgName,
    actPlace: volunteer.actPlace,
    actDate: toDateString(volunteer.startDate),
    actTime: actTimeText(volunteer.actBeginTime, volunteer.actEndTime),
    hours: volunteer.recogHours != null ? Number(volunteer.recogHours) : calcHours(volunteer.actBeginTime, volunteer.actEndTime),
    currentRecruit: current != null ? current : 0,
    totalRecruit: total != null ? total : null,
    recruitProgress: recruitProgress(current, total),
    noticeEndDate: toDateString(volunteer.noticeEndDate),
    url: volunteer.url || volunteer.detailUrl || null,
    isBookmarked: !!isBookmarked,
  };
}

// 봉사 상세 DTO (V-06)
function toDetailDto(volunteer, isBookmarked = false) {
  if (!volunteer) return null;
  return {
    id: volunteer.id,
    source: sourceToAndroid(volunteer.source),
    title: volunteer.title,
    orgName: volunteer.orgName,
    categoryCode: volunteer.categoryCode,
    categoryName: getCategoryName(volunteer.categoryCode) || null,
    actPlace: volunteer.actPlace,
    latitude: volunteer.latitude != null ? Number(volunteer.latitude) : null,
    longitude: volunteer.longitude != null ? Number(volunteer.longitude) : null,
    startDate: toDateString(volunteer.startDate),
    endDate: toDateString(volunteer.endDate),
    noticeStartDate: toDateString(volunteer.noticeStartDate),
    noticeEndDate: toDateString(volunteer.noticeEndDate),
    actBeginTime: toTimeString(volunteer.actBeginTime),
    actEndTime: toTimeString(volunteer.actEndTime),
    actWkdy: volunteer.actWkdy,
    actTime: actTimeText(volunteer.actBeginTime, volunteer.actEndTime),
    recogHours: volunteer.recogHours != null ? Number(volunteer.recogHours) : null,
    hours: volunteer.recogHours != null ? Number(volunteer.recogHours) : calcHours(volunteer.actBeginTime, volunteer.actEndTime),
    content: volunteer.content,
    status: volunteer.status,
    statusText: statusToText(volunteer.status),
    dDay: calcDDay(volunteer.noticeEndDate),
    recruitNum: volunteer.recruitNum,
    applyTotal: volunteer.applyTotal,
    currentRecruit: volunteer.applyTotal != null ? volunteer.applyTotal : 0,
    totalRecruit: volunteer.recruitNum != null ? volunteer.recruitNum : null,
    recruitProgress: recruitProgress(volunteer.applyTotal, volunteer.recruitNum),
    tel: volunteer.tel,
    url: volunteer.url || volunteer.detailUrl || null,
    isBookmarked: !!isBookmarked,
  };
}

// 지도용 DTO (V-05)
function toMapDto(volunteer, distanceKm = null) {
  return {
    id: volunteer.id,
    title: volunteer.title,
    categoryCode: volunteer.categoryCode,
    categoryName: getCategoryName(volunteer.categoryCode) || null,
    latitude: volunteer.latitude != null ? Number(volunteer.latitude) : null,
    longitude: volunteer.longitude != null ? Number(volunteer.longitude) : null,
    actPlace: volunteer.actPlace,
    startDate: toDateString(volunteer.startDate),
    status: volunteer.status,
    statusText: statusToText(volunteer.status),
    distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
  };
}

module.exports = {
  sourceToAndroid,
  statusToText,
  recruitProgress,
  toCardDto,
  toDetailDto,
  toMapDto,
  toDateString,
  toIsoString,
};
