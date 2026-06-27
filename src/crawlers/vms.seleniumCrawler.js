'use strict';

// 동적 로딩 fallback. cheerio로 값이 비었을 때만 사용.
// Lambda 환경에서는 Chrome/ChromeDriver가 기본 제공되지 않으므로 Layer 또는 컨테이너 이미지 전제.
const env = require('../config/env');

let webdriver;
let chrome;
try {
  // selenium-webdriver는 선택적. 설치 안 되어 있으면 fallback 비활성.
  // eslint-disable-next-line global-require
  webdriver = require('selenium-webdriver');
  // eslint-disable-next-line global-require
  chrome = require('selenium-webdriver/chrome');
} catch (e) {
  webdriver = null;
}

async function fetchDetailHtmlDynamic(seq) {
  if (!webdriver) throw new Error('selenium-webdriver 미설치 — fallback 불가');
  const { Builder, until, By } = webdriver;
  const options = new chrome.Options();
  options.addArguments(
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,1696'
  );

  let driver;
  try {
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    const url = `${env.vms.baseUrl}${env.vms.detailPath}?seq=${seq}`;
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    const html = await driver.getPageSource();
    return html;
  } finally {
    if (driver) await driver.quit();
  }
}

module.exports = { fetchDetailHtmlDynamic, isAvailable: () => !!webdriver };
