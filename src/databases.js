
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const redis = require('redis');
const config = require('./config');
const { createLogger } = require('./utils/logger');

const logger = createLogger('databases');

let sqliteDb;
let redisClient;

async function initDatabases() {
  try {
    // Initialize SQLite
    sqliteDb = await open({
      filename: config.sqlite.filename,
      driver: sqlite3.Database
    });

    // Initialize Redis
    redisClient = redis.createClient(config.redis);
    await redisClient.connect();

    logger.info('Databases initialized successfully');
  } catch (error) {
    logger.error('Error initializing databases:', error);
    throw error;
  }
}

module.exports = {
  initDatabases,
  getSqliteDb: () => sqliteDb,
  getRedisClient: () => redisClient
};
