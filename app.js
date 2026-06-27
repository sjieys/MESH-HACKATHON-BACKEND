const express = require('express');
const cors = require('cors'); // 모듈 불러오기
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();

// 1. 문지기 세팅 (순서 중요! 기능들보다 위에 있어야 함)
app.use(express.json()); // 프론트가 보낸 JSON 읽기 허용
app.use(cors());         // 모든 프론트엔드 접속 허용 (해커톤 필수)

// 2. 봉사정보 불러오기 API

// VMS
app.get('/api/vms', async (req, res) => {
    try {
        // VMS 봉사활동모집정보 조회 URL
        const apiUrl = 'http://apis.data.go.kr/B460014/vmsdataview/getVollcolectionList';
        
        // VMS 서비스를 위해 발급받은 인증키
        const SERVICE_KEY = 'f6997e0e610954291fefcbde3d5215b60e38bf618741128eb7b64328fc695ff7'; 

        const response = await axios.get(apiUrl, {
            params: {
                serviceKey: SERVICE_KEY,
                numOfRows: 10,
                pageNo: 1,
                strDate: '2024-06-01', // 필수 파라미터: 검색 시작일 (YYYY-MM-DD 형식)
                endDate: '2024-06-30', // 필수 파라미터: 검색 종료일
                areaCode: '0101'       // 필수 파라미터: 서울 지역코드
            }
        });

        // 1. 공공데이터포털에서 받아온 텍스트(XML) 데이터를 JSON으로 변환
        const parser = new xml2js.Parser({ explicitArray: false });
        
        parser.parseString(response.data, (err, result) => {
            if (err) {
                console.error("XML 파싱 에러:", err);
                return res.status(500).send("데이터 변환 중 오류가 발생했습니다.");
            }

            // 2. 변환된 데이터를 터미널에서 확인
            console.log("VMS JSON 변환 데이터:", result);

            // 3. 실제 봉사 목록 배열만 프론트엔드로 쏙 빼서 전달
            // 문서의 응답구조 <response> -> <body> -> <items> -> <item> 에 맞춰서 접근
            const items = result.response.body.items.item;
            res.json(items); 
        });

    } catch (error) {
        console.error('VMS API 연동 중 에러 발생:', error.message);
        res.status(500).send("서버 내부 오류가 발생했습니다.");
    }
});

// 1365
app.get('/api/1365', async (req, res) => {
    try {
        // 1365 모집정보 메인 API
        const apiUrl = 'http://apis.data.go.kr/1741000/volunteerPartcptnService/getVltrSearchWordList';

        // 파라미터는 이렇게 설정해보세요
        const response = await axios.get(apiUrl, {
            params: {
                serviceKey: 'f6997e0e610954291fefcbde3d5215b60e38bf618741128eb7b64328fc695ff7',
                pageNo: 1,
                numOfRows: 10,
                schSido: '6110000', // 예시: 서울특별시
                keyword: '환경',      // 예시: 환경 관련 봉사
                _type: 'json'
            }
        });

        const items = response.data.response.body.items.item;
        res.json(items); 

    } catch (error) {
        console.error('1365 API 연동 중 에러 발생:', error.message);
        res.status(500).send("서버 내부 오류가 발생했습니다.");
    }
});

// 3. 서버 켜기 (무조건 코드 맨 아랫줄에 있어야 함!)
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 켜졌습니다! 주소: http://localhost:${PORT}`);
});