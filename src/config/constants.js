const API_1365_BASE_URL = process.env.API_1365_BASE_URL;
const API_1365_KEY = process.env.API_1365_KEY;

const STATUS_1365 = {
  RECRUITING: 2,
  CLOSED: 3,
};

const VOLUNTEER_SOURCE = {
  API_1365: '1365',
  VMS: 'vms',
};

module.exports = { API_1365_BASE_URL, API_1365_KEY, STATUS_1365, VOLUNTEER_SOURCE };
