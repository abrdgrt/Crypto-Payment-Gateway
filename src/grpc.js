
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { paymentQueue } = require('./queues');
const { redisClient } = require('./databases');
const config = require('./config');
const { createLogger } = require('./utils/logger');

const logger = createLogger('grpc');

const PROTO_PATH = path.join(__dirname, '../protos/payment.proto');

function setupGRPC() {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH);
  const paymentProto = grpc.loadPackageDefinition(packageDefinition).payment;

  const server = new grpc.Server();

  server.addService(paymentProto.PaymentService.service, {
    InitiatePayment: async (call, callback) => {
      const { currency, amount, recipient } = call.request;
      const paymentId = uuidv4();

      try {
        await paymentQueue.add({ paymentId, currency, amount, recipient });
        await redisClient.set(`payment:${paymentId}`, JSON.stringify({ status: 'PENDING', currency, amount, recipient }));
        callback(null, { success: true, paymentId });
      } catch (error) {
        logger.error('gRPC payment initiation error:', error);
        callback({ code: grpc.status.INTERNAL, details: error.message });
      }
    },
    GetPaymentStatus: async (call, callback) => {
      const { paymentId } = call.request;

      try {
        const paymentData = await redisClient.get(`payment:${paymentId}`);
        if (!paymentData) {
          callback({ code: grpc.status.NOT_FOUND, details: 'Payment not found' });
          return;
        }
        
        callback(null, { success: true, payment: JSON.parse(paymentData) });
      } catch (error) {
        logger.error('gRPC payment status check error:', error);
        callback({ code: grpc.status.INTERNAL, details: error.message });
      }
    }
  });

  server.bindAsync(`0.0.0.0:${config.grpc.port}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      logger.error('Failed to start gRPC server:', error);
      return;
    }
    // server.start();
    logger.info(`gRPC server running on port ${port}`);
  });
}

module.exports = { setupGRPC };
