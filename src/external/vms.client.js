'use strict';

const axios = require('axios');
const env = require('../config/env');

const http = axios.create({
  baseURL: env.vms.baseUrl,
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 (VoDa crawler)' },
});

// 목록 HTML
async function fetchListHtml({ pageNo = 1, params = {} } = {}) {
  const res = await http.get(env.vms.listPath, { params: { pageNo, ...params }, responseType: 'text' });
  return res.data;
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
