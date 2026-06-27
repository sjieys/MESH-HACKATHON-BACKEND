'use strict';

const prisma = require('../libs/prisma');
const userRepo = require('../repositories/user.repository');
const authService = require('./auth.service');
const volunteerRepo = require('../repositories/volunteer.repository');
const bookmarkRepo = require('../repositories/bookmark.repository');
const googleAuth = require('../external/googleAuth.client');
const { classifyMbti } = require('../utils/mbtiClassifier');
const { getCategoryName, isValidCategoryCode } = require('../constants/categories');
const { isValidSido, isValidGugun } = require('../constants/regions');
const { toCardDto } = require('../mappers/volunteer.mapper');
const { toDateString } = require('../utils/date');
const AppError = require('../utils/AppError');

const PROVIDER_DB = { google: 'GOOGLE', kakao: 'KAKAO', naver: 'NAVER' };

// U-01 social-login
async function socialLogin({ provider, idToken }) {
  let profile;
  if (provider === 'google') {
    profile = await googleAuth.verifyGoogleIdToken(idToken);
  } else if (provider === 'kakao') {
    profile = await googleAuth.verifyKakaoToken(idToken);
  } else {
    profile = await googleAuth.verifyNaverToken(idToken);
  }

  const providerEnum = PROVIDER_DB[provider];
  let user = await userRepo.findByProvider(providerEnum, profile.providerId);
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await userRepo.createSocialUser({
      provider: providerEnum,
      providerId: profile.providerId,
      email: profile.email || null,
      nickname: profile.name || null,
      lastLoginAt: new Date(),
    });
  } else {
    await userRepo.updateLastLogin(user.id);
  }

  const token = authService.issueToken(user.id);
  return { token, isNewUser };
}

// U-02 onboarding
async function onboarding(userId, body) {
  const { avatarType, interests, day, frequency, activityPlace, groupType, regionType, sidoCd, gugunCd } = body;

  // category 검증
  for (const code of interests) {
    if (!isValidCategoryCode(code)) throw AppError.badRequest(`알 수 없는 관심 분야 코드예요: ${code}`);
  }
  // 지역 검증
  if (regionType === 'CUSTOM') {
    if (sidoCd == null || gugunCd == null) throw AppError.badRequest('지역 직접 설정 시 sidoCd, gugunCd는 필수예요');
    if (!isValidSido(sidoCd)) throw AppError.badRequest('유효하지 않은 시/도 코드예요');
    if (!isValidGugun(sidoCd, gugunCd)) throw AppError.badRequest('유효하지 않은 구/군 코드예요');
  }

  // MBTI 산출
  const result = classifyMbti({ interests, activityPlace, groupType, frequency, regionType }, getCategoryName);

  const mbtiData = {
    mbtiCode: result.mbtiCode,
    mbtiName: result.mbtiName,
    mbtiImageUrl: result.mbtiImageUrl,
    description: result.description,
    day,
    frequency,
    activityPlace,
    groupType,
    regionType,
    sidoCd: regionType === 'CUSTOM' ? sidoCd : null,
    gugunCd: regionType === 'CUSTOM' ? gugunCd : null,
  };

  await prisma.$transaction(async (tx) => {
    await userRepo.upsertOnboarding(userId, mbtiData, tx);
    await userRepo.replaceUserInterests(userId, interests, tx);
    if (avatarType) {
      await tx.user.update({ where: { id: userId }, data: { avatarType } });
    }
  });

  return {
    mbtiImageUrl: result.mbtiImageUrl,
    mbtiCode: result.mbtiCode,
    mbtiName: result.mbtiName,
    description: result.description,
    keywords: result.keywords,
    recommendedActivities: result.recommendedActivities.map((a) => ({ name: a.name, imageUrl: a.imageUrl })),
  };
}

// U-03 mypage
async function getMyPage(userId) {
  const data = await userRepo.getMyPage(userId);
  if (!data.user) throw AppError.unauthorized();

  // 추천 봉사 2개 (관심분야/지역 기반 후보 상위)
  let recommended = [];
  if (data.mbti) {
    const categoryCodes = data.interests.map((i) => i.categoryCode);
    const candidates = await volunteerRepo.findRecommendedCandidates({
      categoryCodes,
      sidoCd: data.mbti.sidoCd,
      take: 10,
    });
    const ids = candidates.map((c) => c.id);
    const bookmarked = await bookmarkRepo.findBookmarkedIds(userId, ids);
    recommended = candidates.slice(0, 2).map((v) => ({
      id: v.id,
      categoryCode: v.categoryCode,
      title: v.title,
      location: v.actPlace,
      date: toDateString(v.startDate),
      dayOfWeek: v.actWkdy || null,
      isBookmarked: bookmarked.has(v.id),
    }));
  }

  const keywords = data.mbti
    ? require('../constants/mbti').MBTI_TYPES[require('../utils/mbtiClassifier').classifyAxes({
        interests: data.interests.map((i) => i.categoryCode),
        activityPlace: data.mbti.activityPlace,
        groupType: data.mbti.groupType,
        frequency: data.mbti.frequency,
        regionType: data.mbti.regionType,
      })]?.keywords || []
    : [];

  return {
    mbtiImageUrl: data.mbti ? data.mbti.mbtiImageUrl : null,
    name: data.user.nickname,
    mbtiCode: data.mbti ? data.mbti.mbtiCode : null,
    mbtiName: data.mbti ? data.mbti.mbtiName : null,
    bookmarkCount: data.bookmarkCount,
    completedCount: data.completedCount,
    totalHours: data.totalHours,
    keywords,
    recommendedActivities: recommended,
  };
}

// U-04 update me
async function updateMe(userId, body) {
  const data = {};
  if (body.nickname !== undefined) data.nickname = body.nickname;
  if (body.avatarType !== undefined) data.avatarType = body.avatarType;
  if (Object.keys(data).length === 0) throw AppError.badRequest('수정할 내용이 없어요');

  const user = await userRepo.updateUser(userId, data);
  const mbti = await userRepo.getMbti(userId);
  return {
    id: user.id,
    nickname: user.nickname,
    avatarType: user.avatarType,
    mbtiImageUrl: mbti ? mbti.mbtiImageUrl : null,
  };
}

// U-05 logout (서버 무상태: 항상 성공)
async function logout() {
  return { message: '로그아웃되었습니다' };
}

module.exports = { socialLogin, onboarding, getMyPage, updateMe, logout };
