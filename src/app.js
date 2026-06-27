'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Security & Utility Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: env.corsOrigins.length ? env.corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging for development
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check (상세 정보가 포함된 내 버전 유지)
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.nodeEnv, time: new Date().toISOString() } });
});

// Swagger UI Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

// API Routes (통합 라우터 하나로 개별 라우터 자동 처리)
app.use('/api', routes);

// 404 & Global Error Handler (반드시 맨 아래에 위치)
app.use(notFound);
app.use(errorHandler);

module.exports = app;