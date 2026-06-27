'use strict';

const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[VoDa] server listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

// graceful shutdown
function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n[VoDa] ${signal} received. closing server...`);
  server.close(() => process.exit(0));
}
['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

module.exports = server;
