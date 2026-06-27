// 1365 sidoCd / gugunCd 코드 테이블
const REGIONS = {
  sido: [
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
  ],
  gugun: {
    6110000: [
      { code: 3010000, name: '종로구' }, { code: 3020000, name: '중구' },
      { code: 3030000, name: '용산구' }, { code: 3040000, name: '성동구' },
      { code: 3050000, name: '광진구' }, { code: 3060000, name: '동대문구' },
      { code: 3070000, name: '중랑구' }, { code: 3080000, name: '성북구' },
      { code: 3090000, name: '강북구' }, { code: 3100000, name: '도봉구' },
      { code: 3110000, name: '노원구' }, { code: 3120000, name: '은평구' },
      { code: 3130000, name: '서대문구' }, { code: 3140000, name: '마포구' },
      { code: 3150000, name: '양천구' }, { code: 3160000, name: '강서구' },
      { code: 3170000, name: '구로구' }, { code: 3180000, name: '금천구' },
      { code: 3190000, name: '영등포구' }, { code: 3200000, name: '동작구' },
      { code: 3210000, name: '관악구' }, { code: 3220000, name: '서초구' },
      { code: 3230000, name: '강남구' }, { code: 3240000, name: '송파구' },
      { code: 3250000, name: '강동구' },
    ],
    6410000: [
      { code: 3010000, name: '수원시' }, { code: 3020000, name: '성남시' },
      { code: 3030000, name: '의정부시' }, { code: 3040000, name: '안양시' },
      { code: 3050000, name: '부천시' }, { code: 3060000, name: '광명시' },
      { code: 3070000, name: '평택시' }, { code: 3080000, name: '동두천시' },
      { code: 3090000, name: '안산시' }, { code: 3100000, name: '고양시' },
      { code: 3110000, name: '과천시' }, { code: 3120000, name: '구리시' },
      { code: 3130000, name: '남양주시' }, { code: 3140000, name: '오산시' },
      { code: 3150000, name: '시흥시' }, { code: 3160000, name: '군포시' },
      { code: 3170000, name: '의왕시' }, { code: 3180000, name: '하남시' },
      { code: 3190000, name: '용인시' }, { code: 3200000, name: '파주시' },
      { code: 3210000, name: '이천시' }, { code: 3220000, name: '안성시' },
      { code: 3230000, name: '김포시' }, { code: 3240000, name: '화성시' },
      { code: 3250000, name: '광주시' },
    ],
  },
};

// GET /api/regions
async function getRegions(req, res, next) {
  try {
    const { sidoCd } = req.query;
    if (sidoCd) {
      return res.json({ gugun: REGIONS.gugun[Number(sidoCd)] || [] });
    }
    res.json({ sido: REGIONS.sido });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRegions };
