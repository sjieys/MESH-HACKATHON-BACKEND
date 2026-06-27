'use strict';

// 최신 PDF onboarding 관심분야 코드 기준
const CATEGORIES = [
  { code: 'ENV', name: '환경·생태' },
  { code: 'CHILD', name: '아동·청소년' },
  { code: 'ELDER', name: '노인·어르신' },
  { code: 'ANIMAL', name: '동물보호' },
  { code: 'DIS', name: '장애인 지원' },
  { code: 'MED', name: '의료·보건' },
  { code: 'MULTI', name: '다문화' },
  { code: 'COM', name: '지역사회' },
  { code: 'CULTURE', name: '문화·예술' },
];

const CATEGORY_CODES = CATEGORIES.map((c) => c.code);
const CATEGORY_MAP = CATEGORIES.reduce((acc, c) => {
  acc[c.code] = c.name;
  return acc;
}, {});

function isValidCategoryCode(code) {
  return CATEGORY_CODES.includes(code);
}

function getCategoryName(code) {
  return CATEGORY_MAP[code] || null;
}

// 1365/VMS 원본 분야명 -> VoDa category code 매핑 (가까운 코드로 변환)
const SOURCE_CATEGORY_MAP = [
  { keywords: ['환경', '생태', '플로깅', '정화', '캠페인'], code: 'ENV' },
  { keywords: ['아동', '청소년', '어린이', '학습', '멘토'], code: 'CHILD' },
  { keywords: ['노인', '어르신', '독거', '경로'], code: 'ELDER' },
  { keywords: ['동물', '유기견', '유기묘', '길고양이', '보호소'], code: 'ANIMAL' },
  { keywords: ['장애', '장애인', '점자', '수어'], code: 'DIS' },
  { keywords: ['의료', '보건', '헌혈', '건강'], code: 'MED' },
  { keywords: ['다문화', '이주', '외국인', '난민'], code: 'MULTI' },
  { keywords: ['지역', '지역사회', '마을', '주민'], code: 'COM' },
  { keywords: ['문화', '예술', '공연', '전시', '번역', '디자인'], code: 'CULTURE' },
];

function mapSourceCategory(rawName) {
  if (!rawName) return 'COM';
  const text = String(rawName);
  for (const entry of SOURCE_CATEGORY_MAP) {
    if (entry.keywords.some((kw) => text.includes(kw))) return entry.code;
  }
  return 'COM';
}

module.exports = {
  CATEGORIES,
  CATEGORY_CODES,
  CATEGORY_MAP,
  isValidCategoryCode,
  getCategoryName,
  mapSourceCategory,
};
