const axios = require('axios');
const { API_1365_BASE_URL, API_1365_KEY } = require('../config/constants');

const client = axios.create({
  baseURL: API_1365_BASE_URL,
  params: { serviceKey: API_1365_KEY, _type: 'json' },
  timeout: 10000,
});

async function getVolunteerList({ keyword, sidoCd, gugunCd, srvcClCode, pageNo = 1, numOfRows = 20 } = {}) {
  const { data } = await client.get('/getVltrSearchWordList', {
    params: { keyword, sidoCd, gugunCd, srvcClCode, pageNo, numOfRows },
  });
  return data.response.body;
}

async function getVolunteerDetail(progrmRegistNo) {
  const { data } = await client.get('/getVltrPartcptnItem', {
    params: { progrmRegistNo },
  });
  return data.response.body.item;
}

async function getVolunteersByArea({ sidoCd, gugunCd, pageNo = 1, numOfRows = 20 } = {}) {
  const { data } = await client.get('/getVltrAreaList', {
    params: { sidoCd, gugunCd, pageNo, numOfRows },
  });
  return data.response.body;
}

async function getVolunteersByCategory({ srvcClCode, pageNo = 1, numOfRows = 20 } = {}) {
  const { data } = await client.get('/getVltrCategoryList', {
    params: { srvcClCode, pageNo, numOfRows },
  });
  return data.response.body;
}

module.exports = { getVolunteerList, getVolunteerDetail, getVolunteersByArea, getVolunteersByCategory };
