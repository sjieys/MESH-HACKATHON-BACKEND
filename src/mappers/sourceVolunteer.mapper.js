'use strict';

// 1365 원본 / VMS 파싱 결과 -> NormalizedVolunteerSourceItem -> Prisma upsert data
const { parseDate, parseTime, calcHours } = require('../utils/date');
const { mapSourceCategory } = require('../constants/categories');

// 1365 상태 코드/문자 -> 내부 status
function normalize1365Status(raw) {
  const v = String(raw || '').trim();
  // progrmSttusSe: 1=모집예정, 2=모집중, 3=모집완료 등 (소스마다 다를 수 있음)
  if (v === '2' || v.includes('모집중')) return 'RECRUITING';
  if (v === '3' || v.includes('마감') || v.includes('완료') || v.includes('종료')) return 'CLOSED';
  if (v === '1' || v.includes('예정')) return 'RECRUITING';
  return 'UNKNOWN';
}

function normalizeVmsStatus(raw) {
  const v = String(raw || '').trim();
  if (v.includes('모집중')) return 'RECRUITING';
  if (v.includes('마감') || v.includes('완료') || v.includes('종료')) return 'CLOSED';
  return 'UNKNOWN';
}

// areaLalo1 "37.55,126.99" -> { latitude, longitude }
function parseLatLng(value) {
  if (!value) return { latitude: null, longitude: null };
  const parts = String(value).split(/[,/\s]+/).filter(Boolean);
  if (parts.length < 2) return { latitude: null, longitude: null };
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return { latitude: null, longitude: null };
  return { latitude: lat, longitude: lng };
}

// 1365 list item + detail item 병합 -> NormalizedVolunteerSourceItem
function from1365(item = {}) {
  const sourceId = String(item.progrmRegistNo || item.progrmRegisterNo || '').trim();
  const beginTime = parseTime(item.actBeginTm);
  const endTime = parseTime(item.actEndTm);
  const { latitude, longitude } = parseLatLng(item.areaLalo1);
  const categoryName = item.srvcClCodeNm || item.srvcClCode || '';
  return {
    source: 'API_1365',
    sourceId,
    title: (item.progrmSj || '제목 없음').slice(0, 200),
    orgName: item.nanmmbyNm || item.mnnstNm || null,
    actPlace: item.actPlace || item.postAdres || null,
    sidoCd: item.sidoCd ? Number(item.sidoCd) : null,
    gugunCd: item.gugunCd ? Number(item.gugunCd) : null,
    latitude,
    longitude,
    categoryCode: mapSourceCategory(categoryName),
    srvcClCode: item.srvcClCode || null,
    startDate: parseDate(item.progrmBgnde),
    endDate: parseDate(item.progrmEndde),
    noticeStartDate: parseDate(item.noticeBgnde),
    noticeEndDate: parseDate(item.noticeEndde),
    actBeginTime: beginTime,
    actEndTime: endTime,
    rawTimeText: null,
    timeParseSource: beginTime || endTime ? 'API' : 'UNKNOWN',
    actWkdy: item.actWkdy || null,
    recogHours: calcHours(beginTime, endTime),
    content: item.progrmCn || null,
    status: normalize1365Status(item.progrmSttusSe),
    rawStatus: item.progrmSttusSe != null ? String(item.progrmSttusSe) : null,
    recruitNum: item.rcritNmpr != null ? Number(item.rcritNmpr) : null,
    applyTotal: item.appTotal != null ? Number(item.appTotal) : null,
    tel: item.telno || null,
    email: item.email || null,
    url: build1365DetailUrl(sourceId),
    detailUrl: null,
    syncedAt: new Date(),
    crawledAt: null,
  };
}

function build1365DetailUrl(progrmRegistNo) {
  return `https://www.1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=${progrmRegistNo}`;
}

// VMS 파싱 결과(이미 cheerio/selenium에서 추출) -> NormalizedVolunteerSourceItem
function fromVms(parsed = {}) {
  const sourceId = String(parsed.seq || parsed.sourceId || '').trim();
  return {
    source: 'VMS',
    sourceId,
    title: (parsed.title || '제목 없음').slice(0, 200),
    orgName: parsed.orgName ? parsed.orgName.slice(0, 100) : null,
    actPlace: parsed.actPlace ? parsed.actPlace.slice(0, 200) : null,
    sidoCd: parsed.sidoCd || null,
    gugunCd: parsed.gugunCd || null,
    latitude: parsed.latitude || null,
    longitude: parsed.longitude || null,
    categoryCode: parsed.categoryCode || mapSourceCategory(parsed.category),
    srvcClCode: null,
    startDate: parseDate(parsed.startDate || parsed.actDate),
    endDate: parseDate(parsed.endDate),
    noticeStartDate: parseDate(parsed.noticeStartDate),
    noticeEndDate: parseDate(parsed.noticeEndDate),
    actBeginTime: parsed.actBeginTime ? parseTime(parsed.actBeginTime) : null,
    actEndTime: parsed.actEndTime ? parseTime(parsed.actEndTime) : null,
    rawTimeText: parsed.rawTimeText || null,
    timeParseSource: parsed.timeParseSource || 'UNKNOWN',
    actWkdy: parsed.actWkdy || null,
    recogHours: parsed.hours != null ? Number(parsed.hours) : null,
    content: parsed.content || null,
    status: normalizeVmsStatus(parsed.status),
    rawStatus: parsed.status || null,
    recruitNum: parsed.totalRecruit != null ? Number(parsed.totalRecruit) : null,
    applyTotal: parsed.currentRecruit != null ? Number(parsed.currentRecruit) : 0,
    tel: parsed.tel || null,
    email: null,
    url: parsed.url || parsed.detailUrl || null,
    detailUrl: parsed.detailUrl || parsed.url || null,
    crawledAt: new Date(),
    syncedAt: null,
  };
}

// NormalizedVolunteerSourceItem -> Prisma upsert payload(create/update 공통 data)
function toPrismaData(item) {
  const { source, sourceId, ...rest } = item;
  // Decimal/숫자 정합성은 Prisma가 처리. null 필드는 그대로.
  return { source, sourceId, ...rest };
}

module.exports = {
  from1365,
  fromVms,
  toPrismaData,
  build1365DetailUrl,
  normalize1365Status,
  normalizeVmsStatus,
  parseLatLng,
};
