'use strict';

const cheerio = require('cheerio');
const env = require('../config/env');

// 본문/제목에서 시간 추출: "09:00~12:00", "09시~14:00", "오전 10시 ~ 오후 1시" 대응
const TIME_REGEX = /(오전|오후)?\s*(\d{1,2})(?:\s*(?:시|:)\s*(\d{0,2}))?\s*(?:~|-|부터|에서)\s*(오전|오후)?\s*(\d{1,2})(?:\s*(?:시|:)\s*(\d{0,2}))?/;

function normalizeHour(hour, meridiem) {
  let h = Number(hour);
  if (Number.isNaN(h)) return null;
  if (meridiem === '오후' && h < 12) h += 12;
  if (meridiem === '오전' && h === 12) h = 0;
  return String(h).padStart(2, '0');
}

function normalizeMinute(minute) {
  return (minute && minute.length ? minute : '00').padStart(2, '0');
}

function parseTimeFromText(text) {
  if (!text) return { actBeginTime: null, actEndTime: null, rawTimeText: null, timeParseSource: 'UNKNOWN' };
  const m = String(text).match(TIME_REGEX);
  if (!m) return { actBeginTime: null, actEndTime: null, rawTimeText: null, timeParseSource: 'UNKNOWN' };
  const beginMeridiem = m[1] || null;
  const endMeridiem = m[4] || beginMeridiem;
  const bh = normalizeHour(m[2], beginMeridiem);
  const bm = normalizeMinute(m[3]);
  const eh = normalizeHour(m[5], endMeridiem);
  const em = normalizeMinute(m[6]);
  if (!bh || !eh) return { actBeginTime: null, actEndTime: null, rawTimeText: m[0], timeParseSource: 'UNKNOWN' };
  return {
    actBeginTime: `${bh}:${bm}`,
    actEndTime: `${eh}:${em}`,
    rawTimeText: m[0],
    timeParseSource: 'CONTENT',
  };
}

// 인원 문자열 "21 / 30명" -> { current, total }
function parseRecruit(text) {
  if (!text) return { currentRecruit: 0, totalRecruit: null };
  const value = String(text);
  const paired = value.match(/(\d+)\s*명?\s*\/\s*(\d+)\s*명?/);
  if (paired) {
    return { currentRecruit: Number(paired[1]), totalRecruit: Number(paired[2]) };
  }
  const labeledTotal = value.match(/모집\s*인원\D*(\d+)/);
  const labeledCurrent = value.match(/(?:신청|참여)\s*인원\D*(\d+)/);
  return {
    currentRecruit: labeledCurrent ? Number(labeledCurrent[1]) : 0,
    totalRecruit: labeledTotal ? Number(labeledTotal[1]) : null,
  };
}

// 목록 HTML에서 상세 seq + url 추출
function parseList(html) {
  const $ = cheerio.load(html);
  const results = [];
  $('a[href*="recruitView.do"], a[onclick*="seq"]').each((_, el) => {
    try {
      const $el = $(el);
      let href = $el.attr('href') || '';
      let seq = null;
      const seqMatch = href.match(/seq=(\d+)/);
      if (seqMatch) {
        seq = seqMatch[1];
      } else {
        const onclick = $el.attr('onclick') || '';
        const m = onclick.match(/(\d{3,})/);
        if (m) seq = m[1];
      }
      if (!seq) return; // seq 없으면 skip
      let url = href;
      if (href && !href.startsWith('http')) {
        url = `${env.vms.baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
      }
      if (!url || !url.startsWith('http')) {
        url = `${env.vms.baseUrl}${env.vms.detailPath}?seq=${seq}`;
      }
      results.push({ seq, detailUrl: url, title: $el.text().trim() || null });
    } catch (e) {
      // item 단위 try/catch
    }
  });
  // 중복 seq 제거
  const seen = new Set();
  return results.filter((r) => {
    if (seen.has(r.seq)) return false;
    seen.add(r.seq);
    return true;
  });
}

// 상세 HTML 파싱. DOM 셀렉터는 실제 VMS 구조에 맞게 조정 필요(item 단위 try/catch).
function parseDetail(html, base = {}) {
  const $ = cheerio.load(html);
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

  const pick = (selectors) => {
    for (const sel of selectors) {
      const t = $(sel).first().text().trim();
      if (t) return t;
    }
    return null;
  };

  const title = base.title || pick(['.view_tit', '.title', 'h2', 'h3']);
  const orgName = pick(['.org', '.organ', '.agency']);
  const actPlace = pick(['.place', '.location', '.addr']);
  const category = pick(['.category', '.field', '.area']);
  const status = pick(['.status', '.state', '.recruit_state']);
  const time = parseTimeFromText(bodyText);
  const recruit = parseRecruit(bodyText);

  return {
    seq: base.seq,
    title,
    orgName,
    actPlace,
    category,
    status,
    actBeginTime: time.actBeginTime,
    actEndTime: time.actEndTime,
    rawTimeText: time.rawTimeText,
    timeParseSource: time.timeParseSource,
    currentRecruit: recruit.currentRecruit,
    totalRecruit: recruit.totalRecruit,
    content: bodyText.slice(0, 2000),
    detailUrl: base.detailUrl,
    url: base.detailUrl,
  };
}

module.exports = { parseList, parseDetail, parseTimeFromText, parseRecruit };
