const si = require('systeminformation');
const cluster = require('cluster');
const os = require('os');
const { createLogger } = require('./utils/logger');

const logger = createLogger('master');

function setupMaster() {
  logger.info(`Master ${process.pid} is running`);

  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  let restartsWithinMinute = 0;
  const restartTimeouts = {};
  
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    
    if (restartTimeouts[worker.process.pid]) {
      clearTimeout(restartTimeouts[worker.process.pid]);
    }
    
    restartTimeouts[worker.process.pid] = setTimeout(() => {
      cluster.fork();
      restartsWithinMinute++;
      if (restartsWithinMinute > 5) { // 5 restarts within 1 minute, alert
        sendAlert(`Worker restart loop detected for ${worker.process.pid}`);
        restartsWithinMinute = 0;
      }
    }, 30000); // Restart after 30 seconds
  });

  // Implement additional master logic here (e.g., load balancing, shared state management)
}

async function adjustWorkerCount() {
  const cpuData = await si.currentLoad();
  if (cpuData.currentload > 70) { // Scale up if CPU load exceeds 70%
    if (workerCount < numCPUs) {
      cluster.fork();
      workerCount++;
    }
  } else if (cpuData.currentload < 30 && workerCount > 1) { // Scale down if below 30%
    cluster.workers.forEach((worker, index) => {
      if (index === 0) { // Keep at least one worker
        return;
      }
      worker.kill();
      workerCount--;
    });
  }
}
setInterval(adjustWorkerCount, 60000); // Check every minute

module.exports = { setupMaster };