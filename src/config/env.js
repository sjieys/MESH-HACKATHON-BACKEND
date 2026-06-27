'use strict';

const path = require('path');
const dotenv = require('dotenv');

// .env를 가장 먼저 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function toList(value) {
  if (!value) return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',

  databaseUrl: process.env.DATABASE_URL,

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  corsOrigins: toList(process.env.CORS_ORIGIN),

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  openapi1365: {
    baseUrl: process.env.OPENAPI_1365_BASE_URL || '',
    serviceKey: process.env.OPENAPI_1365_SERVICE_KEY || '',
  },

  vms: {
    baseUrl: process.env.VMS_BASE_URL || 'https://www.vms.or.kr',
    listPath: process.env.VMS_LIST_PATH || '/partspace/recruit.do',
    detailPath: process.env.VMS_DETAIL_PATH || '/partspace/recruitView.do',
    useSeleniumFallback: process.env.VMS_USE_SELENIUM_FALLBACK === 'true',
    crawlConcurrency: Number(process.env.VMS_CRAWL_CONCURRENCY || 5),
    crawlLimit: Number(process.env.VMS_CRAWL_LIMIT || 200),
  },

  aws: {
    region: process.env.AWS_REGION || 'ap-northeast-2',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
};

module.exports = env;
