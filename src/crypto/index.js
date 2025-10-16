
const EthereumModule = require('./ethereum');
// const BitcoinModule = require('./bitcoin');
const RippleModule = require('./ripple');
const config = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('crypto');

let ethModule, btcModule, xrpModule;
const eth_config = {
  rpcUrl: config.ethereum.rpcUrl,
  privateKey:  config.ethereum.privateKey,
  retryOptions: { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 60000 },
  transactionTimeout: 300000 // 5 minutes
};

async function initCryptoModules() {
  try {
    // ethModule = new EthereumModule(config.ethereum.rpcUrl, config.ethereum.privateKey, config.ethereum.contractAddress);

    ethModule = new EthereumModule(eth_config);
    // btcModule = new BitcoinModule(config.bitcoin.network, config.bitcoin.apiKey);
    // xrpModule = new RippleModule(config.ripple.server);

    await ethModule.init();
    // await xrpModule.init();

    logger.info('Cryptocurrency modules initialized successfully');
  } catch (error) {
    logger.error('Error initializing cryptocurrency modules:', error);
    throw error;
  }
}

module.exports = {
  initCryptoModules,
  getEthModule: () => ethModule,
  // getBtcModule: () => btcModule,
  // getXrpModule: () => xrpModule
};