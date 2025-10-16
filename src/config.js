
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  redis: {
    url: process.env.REDIS_URL
  },
  sqlite: {
    filename: process.env.SQLITE_FILENAME || ':memory:'
  },
  ethereum: {
    rpcUrl: process.env.ETH_RPC_URL,
    privateKey: process.env.ETH_PRIVATE_KEY,
    contractAddress: process.env.ETH_CONTRACT_ADDRESS
  },
  bitcoin: {
    network: process.env.BTC_NETWORK,
    apiKey: process.env.BLOCKCYPHER_API_KEY
  },
  ripple: {
    server: process.env.XRP_SERVER
  },
  queues: {
    payment: 'payment-processing'
  },
  grpc: {
    port: process.env.GRPC_PORT || 50051
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
