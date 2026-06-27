'use strict';

const { DIRECT_SCORE, buildMbtiResult } = require('../constants/mbti');

// 4축 분류 (시나리오 PDF classifyMBTI 정책 반영)
// input: { interests:[code], activityPlace, groupType, frequency, regionType }
function classifyAxes({ interests = [], activityPlace, groupType, frequency, regionType }) {
  // 1축 D/I
  const score = interests.reduce((s, code) => s + (DIRECT_SCORE[code] ?? 0), 0);
  let axis1;
  if (score > 0) axis1 = 'D';
  else if (score < 0) axis1 = 'I';
  else if (regionType === 'ONLINE') axis1 = 'I';
  else if (regionType === 'NEARBY') axis1 = 'D';
  else if (groupType === 'SOLO') axis1 = 'I';
  else if (groupType === 'GROUP') axis1 = 'D';
  else axis1 = 'D';

  // 2축 A/S
  let axis2;
  if (activityPlace === 'OUTDOOR') axis2 = 'A';
  else if (activityPlace === 'INDOOR') axis2 = 'S';
  else axis2 = regionType === 'ONLINE' ? 'S' : 'A';

  // 3축 T/P
  let axis3;
  if (groupType === 'GROUP') axis3 = 'T';
  else if (groupType === 'SOLO') axis3 = 'P';
  else axis3 = 'T';

  // 4축 R/F
  const axis4 = ['WEEKLY', 'MONTHLY_2_3'].includes(frequency) ? 'R' : 'F';

  return `${axis1}${axis2}${axis3}${axis4}`;
}

// 최종 결과 객체 반환 (추천분야 imageUrl까지 포함)
function classifyMbti(input, getCategoryName) {
  const axesCode = classifyAxes(input);
  const base = buildMbtiResult(axesCode);
  const recommendedActivities = base.recommendedCategories.map((code) => ({
    name: getCategoryName ? getCategoryName(code) || code : code,
    imageUrl: `https://cdn.voda.kr/category/${code.toLowerCase()}.png`,
    categoryCode: code,
  }));
  return { ...base, recommendedActivities };
}

module.exports = { classifyAxes, classifyMbti };
