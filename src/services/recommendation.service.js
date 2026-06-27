'use strict';

const userRepo = require('../repositories/user.repository');
const volunteerRepo = require('../repositories/volunteer.repository');
const bookmarkRepo = require('../repositories/bookmark.repository');
const { toCardDto } = require('../mappers/volunteer.mapper');
const { getCategoryName } = require('../constants/categories');
const { calcDDay } = require('../utils/date');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// day(enum) -> 매칭되는 actWkdy 키워드
function dayMatches(day, actWkdy) {
  if (!actWkdy) return false;
  if (day === 'WEEKEND') return ['토', '일', '주말'].some((w) => actWkdy.includes(w));
  if (day === 'WEEKDAY_MORNING' || day === 'WEEKDAY_AFTERNOON') {
    return ['월', '화', '수', '목', '금', '평일'].some((w) => actWkdy.includes(w));
  }
  return true; // ANY
}

// 규칙 기반 점수 + 이유
function scoreVolunteer(v, ctx) {
  let score = 0;
  const reasons = [];
  if (ctx.categoryCodes.includes(v.categoryCode)) {
    score += 40;
    reasons.push(`${getCategoryName(v.categoryCode) || '관심'} 분야`);
  }
  if (ctx.sidoCd && v.sidoCd === ctx.sidoCd) {
    score += 25;
    reasons.push('내 지역');
  }
  if (ctx.day && dayMatches(ctx.day, v.actWkdy)) {
    score += 20;
    reasons.push('가능한 시간대');
  }
  if (v.status === 'RECRUITING') score += 10;
  const dday = calcDDay(v.noticeEndDate);
  if (dday != null && dday >= 0 && dday <= 3) {
    score += 5;
    reasons.push('마감 임박');
  }
  return { score, reason: reasons.length ? reasons.join(' · ') : '회원님께 추천하는 봉사' };
}

// V-02 추천
async function getRecommended(userId, limit = 4) {
  const mbti = await userRepo.getMbti(userId);
  if (!mbti) throw AppError.businessRule('봉사 유형 검사를 먼저 진행해 주세요');

  const interests = await userRepo.getInterests(userId);
  const categoryCodes = interests.map((i) => i.categoryCode);
  const ctx = { categoryCodes, sidoCd: mbti.sidoCd, day: mbti.day };

  const candidates = await volunteerRepo.findRecommendedCandidates({
    categoryCodes,
    sidoCd: mbti.sidoCd,
    take: 100,
  });

  const scored = candidates
    .map((v) => ({ v, ...scoreVolunteer(v, ctx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const ids = scored.map((s) => s.v.id);
  const bookmarked = await bookmarkRepo.findBookmarkedIds(userId, ids);

  // Gemini는 키가 있을 때만 reason을 보강 (없으면 규칙 기반 reason 그대로)
  const items = scored.map((s) => {
    const card = toCardDto(s.v, bookmarked.has(s.v.id));
    return { ...card, recommendReason: s.reason };
  });

  return { mbtiCode: mbti.mbtiCode, mbtiType: mbti.mbtiCode, items };
}

// Gemini 보강 (키 있을 때만). 실패 시 규칙 기반 fallback.
// eslint-disable-next-line no-unused-vars
async function enrichWithGemini(items, mbti) {
  if (!env.gemini.apiKey) return items; // 키 없으면 규칙 기반만
  // TODO: Gemini API 연동. 실패 시 items 그대로 반환.
  return items;
}

module.exports = { getRecommended, enrichWithGemini, scoreVolunteer };
