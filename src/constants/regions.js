'use strict';

// 1365 시도/구군 코드 테이블 (api용 시나리오 흐름 정리.pdf 기준)
// 주의: 구군 코드는 시도별로 동일 패턴(3010000부터)을 사용하므로 sidoCd와 함께 식별해야 한다.

const SIDO = [
  { code: 6110000, name: '서울' },
  { code: 6410000, name: '경기' },
  { code: 6280000, name: '인천' },
  { code: 6260000, name: '부산' },
  { code: 6270000, name: '대구' },
  { code: 6290000, name: '광주' },
  { code: 6300000, name: '대전' },
  { code: 6310000, name: '울산' },
  { code: 5690000, name: '세종' },
  { code: 6420000, name: '강원' },
  { code: 6430000, name: '충북' },
  { code: 6440000, name: '충남' },
  { code: 6450000, name: '전북' },
  { code: 6460000, name: '전남' },
  { code: 6470000, name: '경북' },
  { code: 6480000, name: '경남' },
  { code: 6500000, name: '제주' },
];

const GUGUN = {
  6110000: [ // 서울
    { code: 3010000, name: '종로구' }, { code: 3020000, name: '중구' }, { code: 3030000, name: '용산구' },
    { code: 3040000, name: '성동구' }, { code: 3050000, name: '광진구' }, { code: 3060000, name: '동대문구' },
    { code: 3070000, name: '중랑구' }, { code: 3080000, name: '성북구' }, { code: 3090000, name: '강북구' },
    { code: 3100000, name: '도봉구' }, { code: 3110000, name: '노원구' }, { code: 3120000, name: '은평구' },
    { code: 3130000, name: '서대문구' }, { code: 3140000, name: '마포구' }, { code: 3150000, name: '양천구' },
    { code: 3160000, name: '강서구' }, { code: 3170000, name: '구로구' }, { code: 3180000, name: '금천구' },
    { code: 3190000, name: '영등포구' }, { code: 3200000, name: '동작구' }, { code: 3210000, name: '관악구' },
    { code: 3220000, name: '서초구' }, { code: 3230000, name: '강남구' }, { code: 3240000, name: '송파구' },
    { code: 3250000, name: '강동구' },
  ],
  6410000: [ // 경기
    { code: 3010000, name: '수원시' }, { code: 3020000, name: '성남시' }, { code: 3030000, name: '의정부시' },
    { code: 3040000, name: '안양시' }, { code: 3050000, name: '부천시' }, { code: 3060000, name: '광명시' },
    { code: 3070000, name: '평택시' }, { code: 3080000, name: '동두천시' }, { code: 3090000, name: '안산시' },
    { code: 3100000, name: '고양시' }, { code: 3110000, name: '과천시' }, { code: 3120000, name: '구리시' },
    { code: 3130000, name: '남양주시' }, { code: 3140000, name: '오산시' }, { code: 3150000, name: '시흥시' },
    { code: 3160000, name: '군포시' }, { code: 3170000, name: '의왕시' }, { code: 3180000, name: '하남시' },
    { code: 3190000, name: '용인시' }, { code: 3200000, name: '파주시' }, { code: 3210000, name: '이천시' },
    { code: 3220000, name: '안성시' }, { code: 3230000, name: '김포시' }, { code: 3240000, name: '화성시' },
    { code: 3250000, name: '광주시' },
  ],
  6280000: [ // 인천
    { code: 3010000, name: '중구' }, { code: 3020000, name: '동구' }, { code: 3030000, name: '미추홀구' },
    { code: 3040000, name: '연수구' }, { code: 3050000, name: '남동구' }, { code: 3060000, name: '부평구' },
    { code: 3070000, name: '계양구' }, { code: 3080000, name: '서구' }, { code: 3090000, name: '강화군' },
    { code: 3100000, name: '옹진군' },
  ],
  6260000: [ // 부산
    { code: 3010000, name: '중구' }, { code: 3020000, name: '서구' }, { code: 3030000, name: '동구' },
    { code: 3040000, name: '영도구' }, { code: 3050000, name: '부산진구' }, { code: 3060000, name: '동래구' },
    { code: 3070000, name: '남구' }, { code: 3080000, name: '북구' }, { code: 3090000, name: '해운대구' },
    { code: 3100000, name: '사하구' }, { code: 3110000, name: '금정구' }, { code: 3120000, name: '강서구' },
    { code: 3130000, name: '연제구' }, { code: 3140000, name: '수영구' }, { code: 3150000, name: '사상구' },
    { code: 3160000, name: '기장군' },
  ],
  6270000: [ // 대구
    { code: 3010000, name: '중구' }, { code: 3020000, name: '동구' }, { code: 3030000, name: '서구' },
    { code: 3040000, name: '남구' }, { code: 3050000, name: '북구' }, { code: 3060000, name: '수성구' },
    { code: 3070000, name: '달서구' }, { code: 3080000, name: '달성군' },
  ],
  6290000: [ // 광주
    { code: 3010000, name: '동구' }, { code: 3020000, name: '서구' }, { code: 3030000, name: '남구' },
    { code: 3040000, name: '북구' }, { code: 3050000, name: '광산구' },
  ],
  6300000: [ // 대전
    { code: 3010000, name: '동구' }, { code: 3020000, name: '중구' }, { code: 3030000, name: '서구' },
    { code: 3040000, name: '유성구' }, { code: 3050000, name: '대덕구' },
  ],
  6310000: [ // 울산
    { code: 3010000, name: '중구' }, { code: 3020000, name: '남구' }, { code: 3030000, name: '동구' },
    { code: 3040000, name: '북구' }, { code: 3050000, name: '울주군' },
  ],
  5690000: [], // 세종: 구/군 없음
  6420000: [ // 강원
    { code: 3010000, name: '춘천시' }, { code: 3020000, name: '원주시' }, { code: 3030000, name: '강릉시' },
    { code: 3040000, name: '동해시' }, { code: 3050000, name: '태백시' }, { code: 3060000, name: '속초시' },
    { code: 3070000, name: '삼척시' }, { code: 3080000, name: '홍천군' }, { code: 3090000, name: '횡성군' },
    { code: 3100000, name: '영월군' }, { code: 3110000, name: '평창군' }, { code: 3120000, name: '정선군' },
    { code: 3130000, name: '철원군' }, { code: 3140000, name: '화천군' }, { code: 3150000, name: '양구군' },
    { code: 3160000, name: '인제군' }, { code: 3170000, name: '고성군' }, { code: 3180000, name: '양양군' },
  ],
  6430000: [ // 충북
    { code: 3010000, name: '청주시' }, { code: 3020000, name: '충주시' }, { code: 3030000, name: '제천시' },
    { code: 3040000, name: '보은군' }, { code: 3050000, name: '옥천군' }, { code: 3060000, name: '영동군' },
    { code: 3070000, name: '증평군' }, { code: 3080000, name: '진천군' }, { code: 3090000, name: '괴산군' },
    { code: 3100000, name: '음성군' }, { code: 3110000, name: '단양군' },
  ],
  6440000: [ // 충남
    { code: 3010000, name: '천안시' }, { code: 3020000, name: '공주시' }, { code: 3030000, name: '보령시' },
    { code: 3040000, name: '아산시' }, { code: 3050000, name: '서산시' }, { code: 3060000, name: '논산시' },
    { code: 3070000, name: '계룡시' }, { code: 3080000, name: '당진시' }, { code: 3090000, name: '금산군' },
    { code: 3100000, name: '부여군' }, { code: 3110000, name: '서천군' }, { code: 3120000, name: '청양군' },
    { code: 3130000, name: '홍성군' }, { code: 3140000, name: '예산군' }, { code: 3150000, name: '태안군' },
  ],
  6450000: [ // 전북
    { code: 3010000, name: '전주시' }, { code: 3020000, name: '군산시' }, { code: 3030000, name: '익산시' },
    { code: 3040000, name: '정읍시' }, { code: 3050000, name: '남원시' }, { code: 3060000, name: '김제시' },
    { code: 3070000, name: '완주군' }, { code: 3080000, name: '진안군' }, { code: 3090000, name: '무주군' },
    { code: 3100000, name: '장수군' }, { code: 3110000, name: '임실군' }, { code: 3120000, name: '순창군' },
    { code: 3130000, name: '고창군' }, { code: 3140000, name: '부안군' },
  ],
  6460000: [ // 전남
    { code: 3010000, name: '목포시' }, { code: 3020000, name: '여수시' }, { code: 3030000, name: '순천시' },
    { code: 3040000, name: '나주시' }, { code: 3050000, name: '광양시' }, { code: 3060000, name: '담양군' },
    { code: 3070000, name: '곡성군' }, { code: 3080000, name: '구례군' }, { code: 3090000, name: '고흥군' },
    { code: 3100000, name: '보성군' }, { code: 3110000, name: '화순군' }, { code: 3120000, name: '장흥군' },
    { code: 3130000, name: '강진군' }, { code: 3140000, name: '해남군' }, { code: 3150000, name: '영암군' },
    { code: 3160000, name: '무안군' }, { code: 3170000, name: '함평군' }, { code: 3180000, name: '영광군' },
    { code: 3190000, name: '장성군' }, { code: 3200000, name: '완도군' }, { code: 3210000, name: '진도군' },
    { code: 3220000, name: '신안군' },
  ],
  6470000: [ // 경북
    { code: 3010000, name: '포항시' }, { code: 3020000, name: '경주시' }, { code: 3030000, name: '김천시' },
    { code: 3040000, name: '안동시' }, { code: 3050000, name: '구미시' }, { code: 3060000, name: '영주시' },
    { code: 3070000, name: '영천시' }, { code: 3080000, name: '상주시' }, { code: 3090000, name: '문경시' },
    { code: 3100000, name: '경산시' }, { code: 3110000, name: '군위군' }, { code: 3120000, name: '의성군' },
    { code: 3130000, name: '청송군' }, { code: 3140000, name: '영양군' }, { code: 3150000, name: '영덕군' },
    { code: 3160000, name: '청도군' }, { code: 3170000, name: '고령군' }, { code: 3180000, name: '성주군' },
    { code: 3190000, name: '칠곡군' }, { code: 3200000, name: '예천군' }, { code: 3210000, name: '봉화군' },
    { code: 3220000, name: '울진군' }, { code: 3230000, name: '울릉군' },
  ],
  6480000: [ // 경남
    { code: 3010000, name: '창원시' }, { code: 3020000, name: '진주시' }, { code: 3030000, name: '통영시' },
    { code: 3040000, name: '사천시' }, { code: 3050000, name: '김해시' }, { code: 3060000, name: '밀양시' },
    { code: 3070000, name: '거제시' }, { code: 3080000, name: '양산시' }, { code: 3090000, name: '의령군' },
    { code: 3100000, name: '함안군' }, { code: 3110000, name: '창녕군' }, { code: 3120000, name: '고성군' },
    { code: 3130000, name: '남해군' }, { code: 3140000, name: '하동군' }, { code: 3150000, name: '산청군' },
    { code: 3160000, name: '함양군' }, { code: 3170000, name: '거창군' }, { code: 3180000, name: '합천군' },
  ],
  6500000: [ // 제주
    { code: 3010000, name: '제주시' }, { code: 3020000, name: '서귀포시' },
  ],
};

const SIDO_MAP = SIDO.reduce((acc, s) => { acc[s.code] = s.name; return acc; }, {});

function isValidSido(sidoCd) {
  return SIDO.some((s) => s.code === Number(sidoCd));
}

function isValidGugun(sidoCd, gugunCd) {
  const list = GUGUN[Number(sidoCd)];
  if (!list) return false;
  return list.some((g) => g.code === Number(gugunCd));
}

function getSidoName(sidoCd) {
  return SIDO_MAP[Number(sidoCd)] || null;
}

function getGugunName(sidoCd, gugunCd) {
  const list = GUGUN[Number(sidoCd)] || [];
  const found = list.find((g) => g.code === Number(gugunCd));
  return found ? found.name : null;
}

// VMS 지역명 -> 1365 sidoCd/gugunCd 매핑 helper
function mapRegionNameToCode(sidoName, gugunName) {
  const sido = SIDO.find((s) => sidoName && sidoName.includes(s.name));
  if (!sido) return { sidoCd: null, gugunCd: null };
  let gugunCd = null;
  if (gugunName) {
    const g = (GUGUN[sido.code] || []).find((x) => gugunName.includes(x.name));
    if (g) gugunCd = g.code;
  }
  return { sidoCd: sido.code, gugunCd };
}

module.exports = {
  SIDO,
  GUGUN,
  isValidSido,
  isValidGugun,
  getSidoName,
  getGugunName,
  mapRegionNameToCode,
};
