'use strict';

const axios = require('axios');
const env = require('../config/env');

const http = axios.create({
  baseURL: env.vms.baseUrl,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  },
});

// 목록 HTML (최대 2회 재시도)
async function fetchListHtml({ pageNo = 1, params = {} } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await http.get(env.vms.listPath, { params: { pageNo, ...params }, responseType: 'text' });
      return res.data;
    } catch (e) {
      lastErr = e;
      // 재시도 전 잠시 대기
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// 상세 HTML
async function fetchDetailHtml(seq) {
  const res = await http.get(env.vms.detailPath, { params: { seq }, responseType: 'text' });
  return res.data;
}

function buildDetailUrl(seq) {
  return `${env.vms.baseUrl}${env.vms.detailPath}?seq=${seq}`;
}

module.exports = { fetchListHtml, fetchDetailHtml, buildDetailUrl };
