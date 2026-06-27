'use strict';

// 봉사 MBTI 16유형 constants
// internalAxesCode(4축) -> 제품 표시용 mbtiCode/mbtiName/description/keywords/추천분야

const CDN = 'https://cdn.voda.kr';

const MBTI_TYPES = {
  DATR: {
    mbtiCode: 'STEADY_LEADER', mbtiName: '든든한현장리더',
    description: '사람들과 몸으로 부딪치며 꾸준히 함께하는 행동파',
    keywords: ['현장형', '리더십', '꾸준함'],
    recommendedCategories: ['ELDER', 'CHILD', 'COM'],
  },
  DATF: {
    mbtiCode: 'QUICK_SOLVER', mbtiName: '번개출동해결사',
    description: '필요할 때 모여 직접 돕는 즉흥 행동파',
    keywords: ['순발력', '행사지원', '즉흥'],
    recommendedCategories: ['COM', 'CHILD', 'MED'],
  },
  DAPR: {
    mbtiCode: 'SILENT_WORKER', mbtiName: '묵묵한일꾼',
    description: '혼자서도 몸 쓰는 일을 규칙적으로 해내는 실천가',
    keywords: ['성실', '실천력', '1:1'],
    recommendedCategories: ['ELDER', 'CHILD', 'COM'],
  },
  DAPF: {
    mbtiCode: 'FREE_HELPER', mbtiName: '자유로운손길',
    description: '마음 내킬 때 직접 찾아가 돕는 마이페이스 활동가',
    keywords: ['자유', '방문봉사', '유연함'],
    recommendedCategories: ['ELDER', 'COM', 'MED'],
  },
  DSTR: {
    mbtiCode: 'WARM_HOST', mbtiName: '따뜻한모임지기',
    description: '사람들과 둘러앉아 꾸준히 정을 나누는 관계형',
    keywords: ['관계형', '교육', '정기참여'],
    recommendedCategories: ['ELDER', 'CHILD', 'MULTI'],
  },
  DSTF: {
    mbtiCode: 'MINGLE_MAKER', mbtiName: '어울림메이커',
    description: '가끔 모여 함께 사람을 돕는 사교형',
    keywords: ['사교형', '행사안내', '활발함'],
    recommendedCategories: ['CHILD', 'COM', 'CULTURE'],
  },
  DSPR: {
    mbtiCode: 'CLOSE_KEEPER', mbtiName: '곁을지키는사람',
    description: '한 사람에게 조용히 오래 곁을 내주는 정성형',
    keywords: ['1:1', '멘토링', '정성'],
    recommendedCategories: ['CHILD', 'ELDER', 'DIS'],
  },
  DSPF: {
    mbtiCode: 'GENTLE_TOUCH', mbtiName: '마음닿는대로',
    description: '부담 없이 사람을 돕는 잔잔한 자유형',
    keywords: ['비대면', '상담', '재능기부'],
    recommendedCategories: ['ELDER', 'MULTI', 'DIS'],
  },
  IATR: {
    mbtiCode: 'GREEN_MAKER', mbtiName: '그린메이커형',
    description: '말보다 행동이 먼저인 세상을 바꾸는 실행가',
    keywords: ['실행력', '야외 활동', '체험형'],
    recommendedCategories: ['ENV', 'ANIMAL', 'COM'],
  },
  IATF: {
    mbtiCode: 'GREEN_ACTION', mbtiName: '번개그린액션',
    description: '이슈 있을 때 모여 행동하는 환경 행동파',
    keywords: ['캠페인', '환경행동', '즉흥'],
    recommendedCategories: ['ENV', 'ANIMAL', 'COM'],
  },
  IAPR: {
    mbtiCode: 'NATURE_KEEPER', mbtiName: '뚝심있는자연인',
    description: '혼자서도 자연·동물을 꾸준히 챙기는 실천가',
    keywords: ['뚝심', '자연', '동물보호'],
    recommendedCategories: ['ANIMAL', 'ENV', 'COM'],
  },
  IAPF: {
    mbtiCode: 'LONE_EXPLORER', mbtiName: '홀로걷는탐험가',
    description: '내키는 날 자연으로 향하는 자유로운 활동가',
    keywords: ['자유', '트레킹', '탐험'],
    recommendedCategories: ['ENV', 'ANIMAL', 'CULTURE'],
  },
  ISTR: {
    mbtiCode: 'CRAFT_PARTNER', mbtiName: '손재주협동가',
    description: '실내에서 동료들과 꾸준히 결과물을 만드는 유형',
    keywords: ['손재주', '제작', '협동'],
    recommendedCategories: ['DIS', 'CULTURE', 'CHILD'],
  },
  ISTF: {
    mbtiCode: 'TOGETHER_MAKER', mbtiName: '모여만드는사람',
    description: '가끔 모여 무언가를 함께 만드는 창작형',
    keywords: ['창작', '워크숍', '협업'],
    recommendedCategories: ['CULTURE', 'DIS', 'COM'],
  },
  ISPR: {
    mbtiCode: 'QUIET_ARTISAN', mbtiName: '조용한장인',
    description: '혼자 차분히 손으로 결과물을 쌓는 몰입형',
    keywords: ['몰입형', '실내활동', '집중'],
    recommendedCategories: ['CULTURE', 'DIS', 'ENV'],
  },
  ISPF: {
    mbtiCode: 'MY_PACE_MAKER', mbtiName: '마이페이스메이커',
    description: '내 페이스로 비대면 결과물을 만드는 자유형',
    keywords: ['비대면', '재능기부', '자유'],
    recommendedCategories: ['CULTURE', 'DIS', 'MULTI'],
  },
};

// 1축 D/I 점수표 (최신 PDF 코드 기준)
const DIRECT_SCORE = {
  CHILD: 2,
  ELDER: 2,
  DIS: 2,
  MED: 1,
  MULTI: 1,
  COM: 0,
  CULTURE: -1,
  ENV: -2,
  ANIMAL: -2,
};

function buildMbtiResult(axesCode) {
  const type = MBTI_TYPES[axesCode] || MBTI_TYPES.ISPR;
  const code = type.mbtiCode.toLowerCase();
  return {
    internalAxesCode: axesCode,
    mbtiCode: type.mbtiCode,
    mbtiName: type.mbtiName,
    mbtiImageUrl: `${CDN}/mbti/${code}.png`,
    description: type.description,
    keywords: type.keywords,
    recommendedCategories: type.recommendedCategories,
  };
}

module.exports = {
  MBTI_TYPES,
  DIRECT_SCORE,
  buildMbtiResult,
  CDN,
};
