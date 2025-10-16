// File: index.js
const cluster = require('cluster');
const os = require('os');
const { setupMaster } = require('./src/master');
const { setupWorker } = require('./src/worker');

if (cluster.isMaster) {
  console.log(`I'm now setting up a master mode since it's not a worker`)
  setupMaster();
} else {
  console.log(`I'm now setting up a worker mode since it's not a master`)
  setupWorker();
}