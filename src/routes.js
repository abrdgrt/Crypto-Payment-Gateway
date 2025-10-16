
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('./databases');
const { paymentQueue } = require('./queues');
const { createLogger } = require('./utils/logger');
const ethModule = require('./crypto/ethereum');

const logger = createLogger('routes');

function setupRoutes(app) {
  const router = express();

  router.post('/payment/initiate', async (req, res) => {
    const { currency, amount, recipient } = req.body;
    
    const paymentId = uuidv4();
    
    try {
      // Queue the payment for processing
      await paymentQueue.add({ paymentId, currency, amount, recipient });
      
      // Store payment details in Redis
      await redisClient.set(`payment:${paymentId}`, JSON.stringify({ status: 'PENDING', currency, amount, recipient }));
      
      res.json({ success: true, paymentId });
    } catch (error) {
      logger.error('Payment initiation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/payment/:paymentId', async (req, res) => {
    const { paymentId } = req.params;
    
    try {
      const paymentData = await redisClient.get(`payment:${paymentId}`);
      if (!paymentData) {
        res.status(404).json({ success: false, error: 'Payment not found' });
        return;
      }
      
      res.json({ success: true, payment: JSON.parse(paymentData) });
    } catch (error) {
      logger.error('Payment status check error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/balance/:currency/:address', async (req, res) => {
    const { currency, address } = req.params;
    
    try {
      let balance;
      switch (currency.toUpperCase()) {
        case 'ETH':
          balance = await ethModule.getBalance(address);
          break;
        case 'BTC':
          balance = await btcModule.getBalance(address);
          break;
        case 'XRP':
          balance = await xrpModule.getBalance(address);
          break;
        default:
          throw new Error('Unsupported currency');
      }
      
      res.json({ success: true, balance });
    } catch (error) {
      logger.error('Balance check error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.use('/api/v1', router);
}

module.exports = { setupRoutes };