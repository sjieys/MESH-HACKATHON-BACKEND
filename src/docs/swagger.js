'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const successResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: { type: 'object' },
  },
};

const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'VALIDATION_ERROR' },
        message: { type: 'string', example: '입력값을 확인해 주세요' },
      },
    },
  },
};

const volunteerCard = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 101 },
    source: { type: 'string', example: '1365' },
    status: { type: 'string', example: 'RECRUITING' },
    statusText: { type: 'string', example: '모집중' },
    categoryCode: { type: 'string', example: 'ENV' },
    categoryName: { type: 'string', example: '환경·생태' },
    dDay: { type: 'integer', example: 8, nullable: true },
    title: { type: 'string', example: '한강 플로깅 환경 캠페인' },
    orgName: { type: 'string', example: '서울환경연합', nullable: true },
    actPlace: { type: 'string', example: '서울 마포구', nullable: true },
    actDate: { type: 'string', example: '2026-07-12', nullable: true },
    actTime: { type: 'string', example: '09:00~12:00', nullable: true },
    hours: { type: 'number', example: 3, nullable: true },
    currentRecruit: { type: 'integer', example: 21 },
    totalRecruit: { type: 'integer', example: 30, nullable: true },
    recruitProgress: { type: 'integer', example: 70 },
    url: { type: 'string', example: 'https://www.1365.go.kr/...', nullable: true },
    isBookmarked: { type: 'boolean', example: false },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VoDa API',
      version: '1.0.0',
      description: 'VoDa 개인화 봉사 매칭 앱 백엔드 API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    tags: [
      { name: 'Health' },
      { name: 'Users' },
      { name: 'Volunteers' },
      { name: 'Bookmarks' },
      { name: 'Activities' },
      { name: 'Search' },
      { name: 'Home' },
      { name: 'Constants' },
      { name: 'Debug' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: successResponse,
        ErrorResponse: errorResponse,
        VolunteerCard: volunteerCard,
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: '서버 상태 확인',
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  example: { success: true, data: { status: 'ok', env: 'development', time: '2026-06-28T00:00:00.000Z' } },
                },
              },
            },
          },
        },
      },
      '/api/users/social-login': {
        post: {
          tags: ['Users'],
          summary: '소셜 로그인 및 가입',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['provider', 'idToken'],
                  properties: {
                    provider: { type: 'string', enum: ['google', 'kakao', 'naver'], example: 'google' },
                    idToken: { type: 'string', example: 'google-oauth-id-token' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '기존 사용자 로그인 성공' },
            201: { description: '신규 사용자 가입 및 로그인 성공' },
            400: { description: '입력값 오류', content: { 'application/json': { schema: errorResponse } } },
            401: { description: '토큰 검증 실패', content: { 'application/json': { schema: errorResponse } } },
          },
        },
      },
      '/api/users/onboarding': {
        post: {
          tags: ['Users'],
          summary: '온보딩 저장 및 MBTI 결과 반환',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  avatarType: 'SPROUT',
                  interests: ['ENV', 'ANIMAL', 'COM'],
                  day: 'WEEKEND',
                  frequency: 'WEEKLY',
                  activityPlace: 'OUTDOOR',
                  groupType: 'GROUP',
                  regionType: 'CUSTOM',
                  sidoCd: 6110000,
                  gugunCd: 3140000,
                },
              },
            },
          },
          responses: {
            200: {
              description: '저장 성공',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      mbtiImageUrl: 'https://cdn.voda.kr/mbti/green_maker.png',
                      mbtiCode: 'GREEN_MAKER',
                      mbtiName: '그린메이커형',
                      description: '말보다 행동이 먼저인 세상을 바꾸는 실행가',
                      keywords: ['실행력', '야외 활동', '체험형'],
                      recommendedActivities: [
                        { name: '환경·생태', imageUrl: 'https://cdn.voda.kr/category/env.png' },
                      ],
                    },
                  },
                },
              },
            },
            401: { description: '미인증', content: { 'application/json': { schema: errorResponse } } },
          },
        },
      },
      '/api/users/mypage': {
        get: {
          tags: ['Users'],
          summary: '마이페이지 정보 조회',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } },
            401: { description: '미인증', content: { 'application/json': { schema: errorResponse } } },
          },
        },
      },
      '/api/users/me': {
        put: {
          tags: ['Users'],
          summary: '내 정보 수정',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { nickname: '강민지', avatarType: 'SPROUT' },
              },
            },
          },
          responses: {
            200: { description: '수정 성공', content: { 'application/json': { schema: successResponse } } },
            401: { description: '미인증', content: { 'application/json': { schema: errorResponse } } },
          },
        },
      },
      '/api/users/logout': {
        post: {
          tags: ['Users'],
          summary: '로그아웃',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '로그아웃 성공', content: { 'application/json': { example: { success: true, data: { message: '로그아웃되었습니다' } } } } },
          },
        },
      },
      '/api/volunteers': {
        get: {
          tags: ['Volunteers'],
          summary: '봉사 목록',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string', example: 'ENV' } },
            { name: 'sidoCd', in: 'query', schema: { type: 'integer', example: 6110000 } },
            { name: 'gugunCd', in: 'query', schema: { type: 'integer', example: 3140000 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['RECRUITING', 'CLOSED'] } },
            { name: 'keyword', in: 'query', schema: { type: 'string', example: '환경' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['latest', 'deadline'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
            { name: 'size', in: 'query', schema: { type: 'integer', example: 20 } },
          ],
          responses: {
            200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } },
          },
        },
      },
      '/api/volunteers/recommended': {
        get: {
          tags: ['Volunteers'],
          summary: 'MBTI 기반 추천',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', example: 4 } }],
          responses: { 200: { description: '추천 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/volunteers/deadline': {
        get: {
          tags: ['Volunteers'],
          summary: '마감 임박 봉사',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'days', in: 'query', schema: { type: 'integer', example: 3 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } },
          ],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/volunteers/schedule': {
        get: {
          tags: ['Volunteers'],
          summary: '시간 기반 봉사 매칭',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'timeSlot', in: 'query', schema: { type: 'string', enum: ['WEEKDAY_MORNING', 'WEEKDAY_AFTERNOON', 'WEEKEND', 'ANY'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } },
          ],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/volunteers/map': {
        get: {
          tags: ['Volunteers'],
          summary: '지도용 봉사 목록',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'lat', in: 'query', schema: { type: 'number', example: 37.5512 } },
            { name: 'lng', in: 'query', schema: { type: 'number', example: 126.9882 } },
            { name: 'radius', in: 'query', schema: { type: 'integer', example: 5 } },
            { name: 'category', in: 'query', schema: { type: 'string', example: 'ENV' } },
          ],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/volunteers/{id}': {
        get: {
          tags: ['Volunteers'],
          summary: '봉사 상세',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 101 } }],
          responses: {
            200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } },
            404: { description: '봉사 없음', content: { 'application/json': { schema: errorResponse } } },
          },
        },
      },
      '/api/bookmarks': {
        get: {
          tags: ['Bookmarks'],
          summary: '찜 목록',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
        post: {
          tags: ['Bookmarks'],
          summary: '찜 추가',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { example: { volunteerId: 101 } } } },
          responses: { 201: { description: '추가 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/bookmarks/{volunteerId}': {
        delete: {
          tags: ['Bookmarks'],
          summary: '찜 취소',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'volunteerId', in: 'path', required: true, schema: { type: 'integer', example: 101 } }],
          responses: { 200: { description: '취소 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/activities': {
        get: {
          tags: ['Activities'],
          summary: '내 활동 목록',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'scheduled', 'completed', 'cancelled'] } }],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
        post: {
          tags: ['Activities'],
          summary: '활동 신청 기록',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { example: { volunteerId: 101, scheduledDate: '2026-07-12' } } } },
          responses: { 201: { description: '생성 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/activities/stats': {
        get: {
          tags: ['Activities'],
          summary: '활동 통계',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/activities/{id}/complete': {
        put: {
          tags: ['Activities'],
          summary: '활동 완료 처리',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 501 } }],
          requestBody: { required: false, content: { 'application/json': { example: { hours: 3 } } } },
          responses: { 200: { description: '완료 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/activities/{id}/cancel': {
        post: {
          tags: ['Activities'],
          summary: '활동 신청 취소',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 501 } }],
          responses: { 200: { description: '취소 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/search': {
        get: {
          tags: ['Search'],
          summary: '검색',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'keyword', in: 'query', required: true, schema: { type: 'string', example: '환경' } },
            { name: 'category', in: 'query', schema: { type: 'string', example: 'ENV' } },
            { name: 'sidoCd', in: 'query', schema: { type: 'integer', example: 6110000 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['RECRUITING', 'CLOSED'] } },
          ],
          responses: { 200: { description: '검색 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/search/popular': {
        get: {
          tags: ['Search'],
          summary: '인기 검색어',
          parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/search/history': {
        get: {
          tags: ['Search'],
          summary: '최근 검색어',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
        delete: {
          tags: ['Search'],
          summary: '검색 기록 삭제',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', schema: { type: 'integer', example: 9 } }],
          responses: { 200: { description: '삭제 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/home': {
        get: {
          tags: ['Home'],
          summary: '홈 화면 데이터',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/categories': {
        get: {
          tags: ['Constants'],
          summary: '카테고리 목록',
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/regions': {
        get: {
          tags: ['Constants'],
          summary: '지역 목록',
          parameters: [{ name: 'sidoCd', in: 'query', schema: { type: 'integer', example: 6110000 } }],
          responses: { 200: { description: '조회 성공', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/debug/1365': {
        get: {
          tags: ['Debug'],
          summary: '1365 수집 결과 dry-run',
          parameters: [
            { name: 'pageNo', in: 'query', schema: { type: 'integer', example: 1 } },
            { name: 'numOfRows', in: 'query', schema: { type: 'integer', example: 10 } },
          ],
          responses: { 200: { description: '개발 환경에서만 사용', content: { 'application/json': { schema: successResponse } } } },
        },
      },
      '/api/debug/vms': {
        get: {
          tags: ['Debug'],
          summary: 'VMS 수집 결과 dry-run',
          parameters: [{ name: 'pageNo', in: 'query', schema: { type: 'integer', example: 1 } }],
          responses: { 200: { description: '개발 환경에서만 사용', content: { 'application/json': { schema: successResponse } } } },
        },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
