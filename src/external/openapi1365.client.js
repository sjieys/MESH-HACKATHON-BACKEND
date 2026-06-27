'use strict';

const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

function ensureArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function checkResult(json) {
  // 표준 공공데이터 응답: response.header.resultCode === '00'
  const header = json?.response?.header;
  if (header && header.resultCode && String(header.resultCode) !== '00') {
    throw AppError.external(`1365 API 오류: ${header.resultCode} ${header.resultMsg || ''}`);
  }
}

// 목록 조회
async function fetchList({ pageNo = 1, numOfRows = 10, params = {} } = {}) {
  if (!env.openapi1365.baseUrl || !env.openapi1365.serviceKey) {
    throw AppError.internal('1365 OpenAPI 설정(.env)이 없어요');
  }
  try {
    const url = `${env.openapi1365.baseUrl}/getVltrSearchWordList`;
    const res = await axios.get(url, {
      params: {
        serviceKey: env.openapi1365.serviceKey,
        pageNo,
        numOfRows,
        ...params,
      },
      timeout: 15000,
      responseType: 'text',
    });
    const json = parser.parse(res.data);
    checkResult(json);
    const items = ensureArray(json?.response?.body?.items?.item);
    return items;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.external('1365 목록 조회에 실패했어요');
  }
}

// 상세 조회 (progrmRegistNo)
async function fetchDetail(progrmRegistNo) {
  try {
    const url = `${env.openapi1365.baseUrl}/getVltrPartcptnItem`;
    const res = await axios.get(url, {
      params: {
        serviceKey: env.openapi1365.serviceKey,
        progrmRegistNo,
      },
      timeout: 15000,
      responseType: 'text',
    });
    const json = parser.parse(res.data);
    checkResult(json);
    const item = json?.response?.body?.items?.item;
    return Array.isArray(item) ? item[0] : item || null;
  } catch (err) {
    if (err instanceof AppError) throw err;
    // 상세 실패는 치명적이지 않게 null 반환 (목록 데이터로만 저장)
    return null;
  }
}

module.exports = { fetchList, fetchDetail, ensureArray };
