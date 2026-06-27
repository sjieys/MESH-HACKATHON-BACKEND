'use strict';

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1) 뱃지 티어
  const badges = [
    { code: 'bronze', name: '브론즈 봉사자', thresholdCount: 1 },
    { code: 'silver', name: '실버 봉사자', thresholdCount: 5 },
    { code: 'gold', name: '골드 봉사자', thresholdCount: 10 },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({ where: { code: b.code }, create: b, update: b });
  }

  // 2) 인기 검색어
  const popular = [
    { keyword: '환경정화', searchRank: 1, rankChange: 0, isNew: false },
    { keyword: '유기견', searchRank: 2, rankChange: 2, isNew: true },
    { keyword: '노인돌봄', searchRank: 3, rankChange: -1, isNew: false },
    { keyword: '플로깅', searchRank: 4, rankChange: 1, isNew: false },
    { keyword: '멘토링', searchRank: 5, rankChange: 0, isNew: false },
  ];
  await prisma.popularKeyword.deleteMany({});
  for (const p of popular) {
    await prisma.popularKeyword.create({ data: { ...p, updatedAt: new Date() } });
  }

  // 3) 테스트용 봉사 공고 (fixture)
  const volunteers = [
    {
      source: 'API_1365', sourceId: 'SEED-1001', title: '한강 플로깅 - 쓰레기 줍기 환경 캠페인',
      orgName: '서울환경연합', actPlace: '망원한강공원 1주차장 (마포구)',
      sidoCd: 6110000, gugunCd: 3140000, latitude: 37.5556, longitude: 126.8956,
      categoryCode: 'ENV', startDate: new Date('2026-07-12'), endDate: new Date('2026-07-12'),
      noticeStartDate: new Date('2026-06-20'), noticeEndDate: new Date('2026-07-10'),
      actBeginTime: new Date('1970-01-01T09:00:00'), actEndTime: new Date('1970-01-01T12:00:00'),
      actWkdy: '토', recogHours: 3.0, status: 'RECRUITING', recruitNum: 30, applyTotal: 21,
      url: 'https://www.1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=SEED-1001',
      timeParseSource: 'API', syncedAt: new Date(),
    },
    {
      source: 'API_1365', sourceId: 'SEED-1002', title: '독거노인 도시락 배달 봉사',
      orgName: '서울복지관', actPlace: '서울 종로구',
      sidoCd: 6110000, gugunCd: 3010000, latitude: 37.5729, longitude: 126.9794,
      categoryCode: 'ELDER', startDate: new Date('2026-07-15'), endDate: new Date('2026-07-15'),
      noticeStartDate: new Date('2026-06-25'), noticeEndDate: new Date('2026-06-30'),
      actBeginTime: new Date('1970-01-01T10:00:00'), actEndTime: new Date('1970-01-01T13:00:00'),
      actWkdy: '수', recogHours: 3.0, status: 'RECRUITING', recruitNum: 10, applyTotal: 4,
      url: 'https://www.1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=SEED-1002',
      timeParseSource: 'API', syncedAt: new Date(),
    },
    {
      source: 'VMS', sourceId: 'SEED-2001', title: '유기견 산책 & 미용 봉사',
      orgName: '경기동물보호센터', actPlace: '경기 남양주시',
      sidoCd: 6410000, gugunCd: 3130000, latitude: 37.636, longitude: 127.216,
      categoryCode: 'ANIMAL', startDate: new Date('2026-07-13'), endDate: new Date('2026-07-13'),
      noticeStartDate: new Date('2026-06-20'), noticeEndDate: new Date('2026-07-11'),
      actWkdy: '일', recogHours: 2.0, status: 'RECRUITING', recruitNum: 15, applyTotal: 8,
      rawTimeText: '오후 1시~3시', timeParseSource: 'CONTENT',
      detailUrl: 'https://www.vms.or.kr/partspace/recruitView.do?seq=SEED-2001',
      url: 'https://www.vms.or.kr/partspace/recruitView.do?seq=SEED-2001',
      crawledAt: new Date(),
    },
    {
      source: 'VMS', sourceId: 'SEED-2002', title: '점자책 제작 실내 봉사',
      orgName: '한국시각장애인복지관', actPlace: '서울 영등포구',
      sidoCd: 6110000, gugunCd: 3190000, latitude: 37.5264, longitude: 126.8962,
      categoryCode: 'DIS', startDate: new Date('2026-07-20'), endDate: new Date('2026-07-20'),
      noticeStartDate: new Date('2026-06-22'), noticeEndDate: new Date('2026-07-18'),
      actWkdy: '평일', recogHours: 4.0, status: 'RECRUITING', recruitNum: 20, applyTotal: 5,
      timeParseSource: 'UNKNOWN',
      detailUrl: 'https://www.vms.or.kr/partspace/recruitView.do?seq=SEED-2002',
      url: 'https://www.vms.or.kr/partspace/recruitView.do?seq=SEED-2002',
      crawledAt: new Date(),
    },
  ];
  for (const v of volunteers) {
    await prisma.volunteer.upsert({
      where: { source_sourceId: { source: v.source, sourceId: v.sourceId } },
      create: v,
      update: v,
    });
  }

  // eslint-disable-next-line no-console
  console.log('[seed] done: badges, popular_keywords, volunteers');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('[seed] error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
