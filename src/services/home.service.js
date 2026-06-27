'use strict';

const userRepo = require('../repositories/user.repository');
const volunteerRepo = require('../repositories/volunteer.repository');
const recommendationService = require('./recommendation.service');
const { getCategoryName } = require('../constants/categories');

// H-01 홈 데이터 (섹션별 부분 실패 허용 -> 빈 배열 fallback)
async function getHome(userId) {
  const user = await userRepo.findById(userId);
  const mbti = await userRepo.getMbti(userId);

  const userSection = {
    name: user ? user.nickname : null,
    mbtiCode: mbti ? mbti.mbtiCode : null,
    mbtiType: mbti ? mbti.mbtiCode : null,
    mbtiName: mbti ? mbti.mbtiName : null,
  };

  // 추천 섹션 (실패 시 빈 배열)
  let recommended = [];
  try {
    if (mbti) {
      const r = await recommendationService.getRecommended(userId, 4);
      recommended = r.items.map((v) => ({
        id: v.id,
        title: v.title,
        categoryCode: v.categoryCode,
        categoryName: getCategoryName(v.categoryCode) || null,
        status: v.status,
        dDay: v.dDay,
        isBookmarked: v.isBookmarked,
      }));
    }
  } catch (e) {
    recommended = [];
  }

  // 지역 기반 nearby (실패 시 빈 배열)
  let nearby = [];
  try {
    const sidoCd = mbti ? mbti.sidoCd : null;
    const { items } = await volunteerRepo.findList(
      { sidoCd: sidoCd || undefined, status: 'RECRUITING', sort: 'deadline' },
      { skip: 0, take: 4 }
    );
    nearby = items.map((v) => ({
      id: v.id,
      title: v.title,
      categoryCode: v.categoryCode,
      categoryName: getCategoryName(v.categoryCode) || null,
      actPlace: v.actPlace,
      status: v.status,
    }));
  } catch (e) {
    nearby = [];
  }

  return { user: userSection, recommended, nearby };
}

module.exports = { getHome };
