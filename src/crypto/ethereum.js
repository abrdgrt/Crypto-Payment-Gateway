const { ethers } = require('ethers');
const { createLogger } = require('../utils/logger');
const { retry } = require('../utils/retry');
const { memoize } = require('../utils/memoize');

const logger = createLogger('ethereum');

class EthereumModule {
  constructor(config) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // Memoize expensive operations
    this.getGasPrice = memoize(this.provider.getGasPrice.bind(this.provider), 60000); // 1 minute cache
  }

  async init() {
    await this.updateNetworkInfo();
    logger.info('Advanced Ethereum module initialized');
  }

  async updateNetworkInfo() {
    this.networkId = await this.provider.getNetwork().then(network => network.chainId);
    this.gasPrice = await this.getGasPrice();
    this.maxPriorityFeePerGas = ethers.utils.parseUnits('1', 'gwei'); // Adjust as needed
  }

  async estimateFee(to, value, data = '0x') {
    try {
      const gasLimit = await this.provider.estimateGas({
        to,
        value: ethers.utils.parseEther(value),
        data,
      });
      const feeData = await this.provider.getFeeData();
      
      return {
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        estimatedFee: gasLimit.mul(feeData.maxFeePerGas),
      };
    } catch (error) {
      logger.error('Error estimating Ethereum fee:', error);
      throw error;
    }
  }

  async processPayment(recipient, amount, options = {}) {
    return retry(async () => {
      try {
        const value = ethers.utils.parseEther(amount);
        const nonce = await this.wallet.getTransactionCount();
        const feeData = await this.provider.getFeeData();

        const tx = await this.wallet.sendTransaction({
          to: recipient,
          value,
          nonce,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          maxFeePerGas: feeData.maxFeePerGas,
          gasLimit: options.gasLimit || 21000, // Standard ETH transfer
          type: 2, // EIP-1559 transaction
        });

        const receipt = await tx.wait();
        return {
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        };
      } catch (error) {
        logger.error('Error processing Ethereum payment:', error);
        throw error;
      }
    }, this.config.retryOptions);
  }

  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      logger.error('Error getting Ethereum balance:', error);
      throw error;
    }
  }

  async monitorTransaction(txHash) {
    return new Promise((resolve, reject) => {
      this.provider.once(txHash, (transaction) => {
        resolve(transaction);
      });

      setTimeout(() => {
        reject(new Error('Transaction confirmation timeout'));
      }, this.config.transactionTimeout || 300000); // 5 minutes default
    });
  }

  async getGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice;
    } catch (error) {
      logger.error('Error fetching gas price:', error);
      throw error;
    }
  }

  // New method to sign messages (useful for off-chain signatures)
  async signMessage(message) {
    try {
      return await this.wallet.signMessage(message);
    } catch (error) {
      logger.error('Error signing message:', error);
      throw error;
    }
  }

  // New method to verify signed messages
  async verifyMessage(message, signature) {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress === this.wallet.address;
    } catch (error) {
      logger.error('Error verifying message:', error);
      throw error;
    }
  }
}

module.exports = EthereumModule;