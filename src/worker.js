
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { setupRoutes } = require('./routes');
const { setupWebSocket } = require('./websocket');
const { setupGRPC } = require('./grpc');
const { initDatabases } = require('./databases');
const { initCryptoModules } = require('./crypto');
const { setupQueues } = require('./queues');
const { createLogger } = require('./utils/logger');
const config = require('./config');

const logger = createLogger('worker');

async function setupWorker() {
  try {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    // Middleware
    app.use(express.json({ limit: '1mb' }));
    app.use(helmet());
    app.use(rateLimit(config.rateLimit));

    // Initialize databases
    await initDatabases();

    // Initialize cryptocurrency modules
    await initCryptoModules();

    // Setup routes
    setupRoutes(app);

    // Setup WebSocket
    setupWebSocket(wss);

    // Setup gRPC
    setupGRPC();

    // Setup queues
    setupQueues();

    // Start server
    server.listen(config.port, () => {
      logger.info(`Worker ${process.pid} started on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Error setting up worker:', error);
    process.exit(1);
  }
}

module.exports = { setupWorker };