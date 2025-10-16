
const Queue = require('bull');
const { performance } = require('perf_hooks');
const { redisClient } = require('./databases');
const { getEthModule, getBtcModule, getXrpModule } = require('./crypto');
const { createLogger } = require('./utils/logger');
const config = require('./config');

const logger = createLogger('queues');

const paymentQueue = new Queue(config.queues.payment, config.redis.url);

function setupQueues() {
paymentQueue.process(async (job) => {
const payment = job.data;
const start = performance.now();

try {
let result;
switch (payment.currency.toUpperCase()) {
  case 'ETH':
    result = await getEthModule().processPayment(payment.recipient, payment.amount);
    break;
  case 'BTC':
    const fee = await getBtcModule().estimateFee(1, 2); // Assuming 1 input and 2 outputs
    result = await getBtcModule().processPayment(config.bitcoin.senderAddress, payment.recipient, payment.amount, fee);
    break;
  case 'XRP':
    result = await getXrpModule().processPayment(config.ripple.senderAddress, payment.recipient, payment.amount);
    break;
  default:
    throw new Error('Unsupported currency');
}

await redisClient.set(`payment:${payment.paymentId}`, JSON.stringify({ 
  status: 'COMPLETED', 
  ...payment,
  ...result
}));

const end = performance.now();
logger.info(`Payment ${payment.paymentId} processed in ${end - start}ms`);

// Notify connected clients (implement this in websocket.js)
// wss.broadcast({ type: 'PAYMENT_COMPLETED', paymentId: payment.paymentId });

return result;
} catch (error) {
logger.error('Payment processing error:', error);
await redisClient.set(`payment:${payment.paymentId}`, JSON.stringify({ 
  status: 'FAILED', 
  ...payment,
  error: error.message
}));
throw error;
}
});

logger.info('Queues setup completed');
}

module.exports = { setupQueues, paymentQueue };
