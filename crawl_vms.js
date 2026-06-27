/**
 * VMS(사회복지 자원봉사 인증관리) 봉사모집 크롤링 스크립트
 * https://www.vms.or.kr/partspace/recruit.do
 * 
 * Selenium WebDriver를 사용하여 동적 페이지에서 데이터를 수집합니다.
 * 수집 항목: 제목, 활동지역, 활동구, 봉사기간, 모집기간, 참여인원수, 모집인원수
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// 크롤링 설정
const CONFIG = {
    baseUrl: 'https://www.vms.or.kr/partspace/recruit.do',
    maxPages: 5,           // 수집할 최대 페이지 수 (필요시 조절)
    waitTimeout: 10000,    // 페이지 로딩 대기 시간 (ms)
    outputFile: 'vms_volunteer_data.json',
    csvOutputFile: 'vms_volunteer_data.csv'
};

/**
 * Chrome 옵션 설정
 */
function getChromeOptions() {
    const options = new chrome.Options();
    options.addArguments('--headless');           // 브라우저 창 안 띄움
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--lang=ko-KR');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    return options;
}

/**
 * 봉사 목록 항목에서 데이터 파싱
 */
async function parseVolunteerItem(item) {
    try {
        // 전체 텍스트 가져오기
        const fullText = await item.getText();
        const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // 데이터 초기화
        const data = {
            제목: '',
            활동지역: '',
            활동구: '',
            기관명: '',
            봉사기간_시작: '',
            봉사기간_종료: '',
            모집기간_시작: '',
            모집기간_종료: '',
            참여인원수: 0,
            모집인원수: 0,
            모집상태: ''
        };

        // 첫 번째 줄에서 활동지역 + 제목 추출
        // 패턴: "서울 대면 <제목>" 또는 "경남 대면 <제목>"
        if (lines.length > 0) {
            const firstLine = lines[0];
            const regionMatch = firstLine.match(/^(\S+)\s+(대면|비대면)\s+(.+)/);
            if (regionMatch) {
                data.활동지역 = regionMatch[1]; // 예: 서울, 경남, 부산
                data.제목 = regionMatch[3];
            } else {
                data.제목 = firstLine;
            }
        }

        // 기관명 찾기 (두 번째 줄 혹은 "새 글" 뒤에 오는 텍스트)
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('새 글') && i + 1 < lines.length) {
                data.기관명 = lines[i + 1];
                break;
            }
        }
        // "새 글" 없는 경우 두 번째 줄을 기관명으로
        if (!data.기관명 && lines.length > 1) {
            // 봉사기간, 인원 정보가 아닌 줄을 기관명으로
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].includes('봉사기간') && !lines[i].includes('모집') && !lines[i].match(/\d+\s*\/\s*\d+명/)) {
                    data.기관명 = lines[i];
                    break;
                }
            }
        }

        // 봉사기간 추출
        const fullTextJoined = fullText.replace(/\n/g, ' ');
        const periodMatch = fullTextJoined.match(/봉사기간\s*([\d-]+)\s*~\s*([\d-]+)/);
        if (periodMatch) {
            data.봉사기간_시작 = periodMatch[1];
            data.봉사기간_종료 = periodMatch[2];
        }

        // 참여인원 / 모집인원 추출 (패턴: "0 / 10명" 또는 "11 / 60명")
        const memberMatch = fullTextJoined.match(/(\d+)\s*\/\s*(\d+)명/);
        if (memberMatch) {
            data.참여인원수 = parseInt(memberMatch[1], 10);
            data.모집인원수 = parseInt(memberMatch[2], 10);
        }

        // 모집상태 추출
        if (fullTextJoined.includes('모집중')) {
            data.모집상태 = '모집중';
        } else if (fullTextJoined.includes('모집완료')) {
            data.모집상태 = '모집완료';
        }

        return data;
    } catch (error) {
        console.error('항목 파싱 중 오류:', error.message);
        return null;
    }
}

/**
 * 상세 페이지에서 추가 데이터 수집 (모집기간, 활동구 등)
 */
async function parseDetailPage(driver, url) {
    const detailData = {
        활동구: '',
        모집기간_시작: '',
        모집기간_종료: ''
    };

    try {
        // 새 탭에서 상세 페이지 열기
        await driver.executeScript(`window.open('${url}', '_blank')`);
        const handles = await driver.getAllWindowHandles();
        await driver.switchTo().window(handles[handles.length - 1]);
        
        // 페이지 로딩 대기
        await driver.wait(until.elementLocated(By.css('body')), CONFIG.waitTimeout);
        await driver.sleep(2000);

        const pageText = await driver.findElement(By.css('body')).getText();

        // 모집기간 추출
        const recruitPeriodMatch = pageText.match(/모집기간\s*([\d.-]+)\s*~\s*([\d.-]+)/);
        if (recruitPeriodMatch) {
            detailData.모집기간_시작 = recruitPeriodMatch[1];
            detailData.모집기간_종료 = recruitPeriodMatch[2];
        }

        // 활동구(시군구) 추출
        const districtMatch = pageText.match(/활동장소\s*[\s:]*([^\n]+)/);
        if (districtMatch) {
            // "서울특별시 마포구 ..." 에서 구 추출
            const guMatch = districtMatch[1].match(/(\S+[시군구])/g);
            if (guMatch && guMatch.length > 1) {
                detailData.활동구 = guMatch[1]; // 두 번째가 보통 구
            } else if (guMatch) {
                detailData.활동구 = guMatch[0];
            }
        }

        // 탭 닫기
        await driver.close();
        await driver.switchTo().window(handles[0]);

    } catch (error) {
        console.error('상세 페이지 파싱 오류:', error.message);
        // 에러 시 원래 탭으로 복귀
        const handles = await driver.getAllWindowHandles();
        await driver.switchTo().window(handles[0]);
    }

    return detailData;
}

/**
 * 메인 크롤링 함수
 */
async function crawlVMS() {
    console.log('=== VMS 봉사 모집 크롤링 시작 ===');
    console.log(`대상 URL: ${CONFIG.baseUrl}`);
    console.log(`최대 수집 페이지: ${CONFIG.maxPages}페이지\n`);

    const options = getChromeOptions();
    let driver;

    try {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('Chrome WebDriver 실행 성공');

        // 첫 페이지 접속
        await driver.get(CONFIG.baseUrl);
        await driver.wait(until.elementLocated(By.css('body')), CONFIG.waitTimeout);
        await driver.sleep(3000); // 동적 콘텐츠 로딩 대기

        console.log('페이지 접속 완료\n');

        const allData = [];
        let currentPage = 1;

        while (currentPage <= CONFIG.maxPages) {
            console.log(`--- ${currentPage} 페이지 크롤링 중 ---`);

            // 봉사 목록 항목 찾기
            // VMS 사이트 구조: 리스트 형태의 봉사 항목들
            let items = [];
            
            try {
                // 목록 컨테이너의 각 항목을 찾기 (a 태그 링크 기반)
                items = await driver.findElements(By.css('a[href*="recruitView.do"]'));
            } catch (e) {
                console.log('목록 항목을 찾을 수 없습니다. 다른 선택자 시도...');
                try {
                    items = await driver.findElements(By.css('.list_wrap li, .recruit_list li, .board_list li'));
                } catch (e2) {
                    console.log('대체 선택자도 실패. 페이지 전체 텍스트에서 파싱 시도...');
                }
            }

            if (items.length === 0) {
                console.log('더 이상 항목이 없습니다. 크롤링 종료.');
                break;
            }

            console.log(`발견된 항목 수: ${items.length}`);

            // 각 항목 파싱
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const parsed = await parseVolunteerItem(item);
                
                if (parsed && parsed.제목) {
                    // 상세 페이지 URL 추출
                    let detailUrl = '';
                    try {
                        detailUrl = await item.getAttribute('href');
                    } catch (e) {
                        // href가 없을 수 있음
                    }

                    // 상세 페이지에서 모집기간, 활동구 추가 수집
                    if (detailUrl && i < 3) { // 처음 3개 항목만 상세 접근 (속도 위해)
                        const detailData = await parseDetailPage(driver, detailUrl);
                        parsed.활동구 = detailData.활동구 || parsed.활동구;
                        parsed.모집기간_시작 = detailData.모집기간_시작 || parsed.모집기간_시작;
                        parsed.모집기간_종료 = detailData.모집기간_종료 || parsed.모집기간_종료;
                    }

                    allData.push(parsed);
                    console.log(`  [${allData.length}] ${parsed.활동지역} | ${parsed.제목.substring(0, 30)}...`);
                }
            }

            // 다음 페이지로 이동
            currentPage++;
            if (currentPage <= CONFIG.maxPages) {
                try {
                    // 페이지네이션 클릭
                    const nextBtn = await driver.findElement(
                        By.xpath(`//a[contains(@onclick, "page=${currentPage}") or contains(text(), "${currentPage}") or contains(@href, "page=${currentPage}")]`)
                    );
                    await nextBtn.click();
                    await driver.sleep(2000);
                } catch (e) {
                    // 대안: JavaScript로 페이지 이동
                    try {
                        await driver.executeScript(`
                            if (typeof goPage === 'function') goPage(${currentPage});
                            else if (typeof fn_search === 'function') fn_search(${currentPage});
                        `);
                        await driver.sleep(2000);
                    } catch (e2) {
                        console.log(`${currentPage} 페이지로 이동 실패. 크롤링 종료.`);
                        break;
                    }
                }
            }
        }

        console.log(`\n=== 크롤링 완료: 총 ${allData.length}건 수집 ===\n`);

        // 데이터 저장
        if (allData.length > 0) {
            saveToJSON(allData);
            saveToCSV(allData);
        } else {
            console.log('수집된 데이터가 없습니다.');
        }

        return allData;

    } catch (error) {
        console.error('크롤링 중 오류 발생:', error.message);
        console.error('상세 에러:', error.stack);
    } finally {
        if (driver) {
            await driver.quit();
            console.log('WebDriver 종료');
        }
    }
}

/**
 * JSON 파일로 저장
 */
function saveToJSON(data) {
    const outputPath = path.join(__dirname, CONFIG.outputFile);
    const output = {
        수집일시: new Date().toISOString(),
        출처: 'https://www.vms.or.kr/partspace/recruit.do',
        총_건수: data.length,
        데이터: data
    };
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`JSON 저장 완료: ${outputPath}`);
}

/**
 * CSV 파일로 저장
 */
function saveToCSV(data) {
    const outputPath = path.join(__dirname, CONFIG.csvOutputFile);
    const headers = ['제목', '활동지역', '활동구', '기관명', '봉사기간_시작', '봉사기간_종료', '모집기간_시작', '모집기간_종료', '참여인원수', '모집인원수', '모집상태'];
    
    let csv = '\uFEFF'; // BOM for Excel 한글 호환
    csv += headers.join(',') + '\n';
    
    data.forEach(item => {
        const row = headers.map(header => {
            const value = String(item[header] || '');
            // CSV에서 쉼표, 따옴표 이스케이프 처리
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csv += row.join(',') + '\n';
    });

    fs.writeFileSync(outputPath, csv, 'utf-8');
    console.log(`CSV 저장 완료: ${outputPath}`);
}

// 실행
crawlVMS().catch(console.error);
