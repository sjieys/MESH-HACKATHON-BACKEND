'use strict';

const { z } = require('zod');
const { CATEGORY_CODES } = require('../constants/categories');

const AVATAR_TYPES = ['SPROUT', 'HERB', 'CLOVER', 'TREE', 'PAW', 'PALETTE', 'HANDSHAKE', 'STAR'];

const socialLoginBody = z.object({
  provider: z.enum(['google', 'kakao', 'naver']),
  idToken: z.string().min(1, 'idToken은 필수예요'),
});

const onboardingBody = z
  .object({
    // 최신 PDF의 avartar 오타도 받아서 avatarType으로 normalize
    avatarType: z.enum(AVATAR_TYPES).optional(),
    avartar: z.enum(AVATAR_TYPES).optional(),
    interests: z
      .array(z.enum(CATEGORY_CODES))
      .min(1, '관심 분야를 1개 이상 선택해 주세요')
      .max(3, '관심 분야는 최대 3개까지 선택할 수 있어요'),
    day: z.enum(['WEEKDAY_MORNING', 'WEEKDAY_AFTERNOON', 'WEEKEND', 'ANY']),
    frequency: z.enum(['MONTHLY_1', 'MONTHLY_2_3', 'WEEKLY', 'IRREGULAR']),
    activityPlace: z.enum(['INDOOR', 'OUTDOOR']),
    groupType: z.enum(['SOLO', 'GROUP']),
    regionType: z.enum(['NEARBY', 'CUSTOM', 'ONLINE']),
    sidoCd: z.number().int().optional().nullable(),
    gugunCd: z.number().int().optional().nullable(),
  })
  .transform((data) => {
    // avartar(오타) -> avatarType normalize
    if (!data.avatarType && data.avartar) data.avatarType = data.avartar;
    return data;
  })
  .superRefine((data, ctx) => {
    if (data.regionType === 'CUSTOM') {
      if (data.sidoCd == null || data.gugunCd == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: '지역 직접 설정 시 sidoCd, gugunCd는 필수예요', path: ['sidoCd'] });
      }
    }
  });

const updateMeBody = z
  .object({
    nickname: z.string().trim().min(1, '닉네임을 입력해 주세요').max(50, '닉네임은 50자 이하예요').optional(),
    name: z.string().trim().min(1).max(50).optional(), // 구 필드 호환
    avatarType: z.enum(AVATAR_TYPES).optional(),
  })
  .transform((data) => {
    if (!data.nickname && data.name) data.nickname = data.name;
    delete data.name;
    return data;
  });

module.exports = { socialLoginBody, onboardingBody, updateMeBody };
