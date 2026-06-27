# VoDa Backend

개인화 봉사 매칭 앱 `VoDa`의 백엔드. 1365 OpenAPI + VMS 크롤링 데이터를 `volunteers` 캐시에 적재하고, Android 앱에 봉사 조회/추천/찜/활동 API를 제공한다.

## 기술 스택
Node.js 20+ · Express · Prisma · MySQL · JWT · zod · fast-xml-parser · cheerio · selenium-webdriver · dayjs · google-auth-library

## 폴더 구조
```
src/
  app.js, server.js
  config/        환경변수 로딩
  constants/     categories, regions, mbti
  libs/          prisma client
  utils/         response, AppError, asyncHandler, pagination, date, mbtiClassifier
  mappers/       volunteer DTO, source 정규화
  middlewares/   auth, validate, error, notFound
  validators/    zod 스키마
  routes/        엔드포인트
  controllers/   요청/응답
  services/      비즈니스 로직
  repositories/  Prisma 쿼리
  external/      1365 client, google auth, vms client
  crawlers/      vms cheerio / selenium
  jobs/          sync1365, syncVms (npm run sync:*)
  lambdas/       vmsSyncLambda (EventBridge)
  docs/          Swagger/OpenAPI 설정
prisma/          schema.prisma, seed.js
```

## 실행 방법
```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 작성
cp .env.example .env       # Windows: copy .env.example .env
#  -> DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, OPENAPI_1365_SERVICE_KEY 등 채우기

# 3. Prisma client 생성
npm run db:generate

# 4. DB 마이그레이션
npm run db:migrate -- --name init

# 5. seed (뱃지/인기검색어/테스트 봉사공고)
npm run db:seed

# 6. 서버 실행
npm run dev

# 7. health check
curl http://localhost:3000/health
```

## 데이터 동기화
```bash
npm run sync:1365   # 1365 OpenAPI 목록+상세 병합 -> volunteers upsert
npm run sync:vms    # VMS 크롤링 -> volunteers upsert
```
- 앱 API는 항상 DB 캐시(`volunteers`)를 조회한다. 요청마다 1365/VMS를 직접 호출하지 않는다.
- 수집은 sync job / Lambda에서만 수행한다.
- 개발용 확인 라우트(`GET /api/debug/1365`, `GET /api/debug/vms`)는 `NODE_ENV=production`에서 비활성.

## AWS EventBridge / Lambda (VMS)
- 핸들러: `src/lambdas/vmsSyncLambda.js` → `exports.handler`
- EventBridge cron(예: 매일 새벽)으로 주기 실행.
- Selenium fallback(`VMS_USE_SELENIUM_FALLBACK=true`)을 쓰려면 Lambda에 Chrome/ChromeDriver가 필요하다. Lambda Layer 또는 컨테이너 이미지를 전제로 배포할 것. 기본값은 `false`(cheerio만 사용).

## 주요 환경변수
| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | MySQL 접속 문자열 |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | 토큰 서명/만료 |
| `GOOGLE_CLIENT_ID` | 구글 OAuth idToken 검증 |
| `OPENAPI_1365_BASE_URL` / `OPENAPI_1365_SERVICE_KEY` | 1365 OpenAPI |
| `VMS_BASE_URL` / `VMS_*` | VMS 크롤링 |
| `GEMINI_API_KEY` | (선택) AI 추천 보강. 없으면 규칙 기반 추천만 사용 |

## API 요약
인증 불필요: `POST /api/users/social-login`, `GET /api/categories`, `GET /api/regions`, `GET /api/search/popular`. 그 외 전부 `Authorization: Bearer {token}` 필요.

- Users: social-login, onboarding, mypage, me(수정), logout
- Volunteers: 목록, recommended, deadline, schedule, map, :id 상세
- Bookmarks: 목록/추가/취소
- Activities: 목록/신청/완료/취소/통계
- Search: 검색/인기/최근/삭제
- Home / Categories / Regions

상세 요청·응답 예시는 서버 실행 후 Swagger에서 확인한다.

- Swagger UI: `http://localhost:3000/api-docs/`
- OpenAPI JSON: `http://localhost:3000/swagger.json`

## 주의
- 실제 secret/API key는 코드에 하드코딩하지 않고 `.env`에서만 읽는다. `.env.example`에는 placeholder만.
- 공통 응답 형식: 성공 `{ success:true, data }`, 실패 `{ success:false, error:{ code, message } }`.
- 날짜 `YYYY-MM-DD`, 시간 `HH:mm`, 일시 ISO string. 계산용 값(시간/인원)은 숫자로 응답.
