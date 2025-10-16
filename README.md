
# 🚀 Crypto Payment Service

A high-performance Node.js microservice for handling cryptocurrency operations, real-time WebSocket connections, secure API routes, gRPC communication, and queue-based background processing.

This service is designed as part of a modular crypto system — integrating blockchain modules, databases, and distributed workers for transaction processing, price feeds, and wallet operations.

---

## 🧩 Features

* 🔒 **Security-first setup** — via [Helmet](https://github.com/helmetjs/helmet) and request rate limiting
* 💬 **WebSocket Server** — supports live crypto data streaming and real-time updates
* 🧠 **gRPC Integration** — efficient service-to-service communication
* 💾 **Multi-database Initialization** — modular data layer setup
* 💰 **Crypto Modules** — plug-and-play blockchain integrations
* ⚙️ **Job Queues** — background task handling for transactions, pricing, and sync jobs
* 🧾 **Structured Logging** — centralized log handling via custom logger utility

---

## 🏗️ Architecture Overview

```
+---------------------+
|     Client App      |
+---------+-----------+
          |
          v
+---------------------+         +-------------------+
|   Express Server    | <-----> |   WebSocket (WS)  |
| (REST + Middleware) |         +-------------------+
+---------+-----------+
          |
          v
+---------------------+         +-------------------+
|     gRPC Service    | <-----> |   Other Workers   |
+---------------------+         +-------------------+
          |
          v
+---------------------+
|   Crypto Modules    |
| (Wallets, Chains)   |
+---------------------+
          |
          v
+---------------------+
|   Databases / Queues|
+---------------------+
```

---

## 🧰 Tech Stack

| Layer               | Technology                                                           |
| ------------------- | -------------------------------------------------------------------- |
| Server Framework    | [Express.js](https://expressjs.com/)                                 |
| Security Middleware | [Helmet](https://helmetjs.github.io/)                                |
| Rate Limiting       | [express-rate-limit](https://github.com/nfriedly/express-rate-limit) |
| Realtime Messaging  | [ws (WebSocket)](https://github.com/websockets/ws)                   |
| RPC Communication   | [gRPC](https://grpc.io/)                                             |
| Logging Utility     | Winston / Custom logger                                              |
| Queue Management    | Bull / RabbitMQ (via `setupQueues`)                                  |
| Crypto Layer        | Modular blockchain integrations (via `initCryptoModules`)            |
| Databases           | Configurable adapters (SQL, NoSQL, etc.)                             |

---

## ⚙️ Project Structure

```
crypto-worker/
├── src/
│   ├── config/           # Environment & constants
│   ├── crypto/           # Crypto-specific modules
│   ├── databases/        # DB initialization logic
│   ├── grpc/             # gRPC setup
│   ├── queues/           # Queue initialization
│   ├── routes/           # Express routes
│   ├── utils/            # Logger and helpers
│   ├── websocket/        # WebSocket server setup
│   └── worker.js         # Worker entrypoint (this file)
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/crypto-worker.git
cd crypto-worker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file or edit `config/index.js` to include:

```bash
PORT=4000
DB_URL=mongodb://localhost:27017/crypto
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 4. Run the worker

```bash
node src/worker.js
```

or with [PM2](https://pm2.keymetrics.io/) for production:

```bash
pm2 start src/worker.js --name crypto-worker
```

---

## 🧪 Development

For local debugging:

```bash
npm run dev
```

This starts the server with hot-reload (if using `nodemon`) and logs all activity.

---

## 🛠️ Example Endpoints

| Method | Endpoint              | Description                       |
| ------ | --------------------- | --------------------------------- |
| `GET`  | `/status`             | Check worker health               |
| `POST` | `/crypto/transaction` | Submit a transaction              |
| `WS`   | `/ws`                 | Subscribe to real-time updates    |
| `gRPC` | `SendTransaction()`   | Remote procedure for internal use |

---

## 📈 Logging

Logs are handled via a centralized logger in `/utils/logger.js`:

* Info, Error, and Debug levels
* Timestamped, formatted output
* Can integrate with ELK or Prometheus stack

---

## 🧩 Extending

You can extend the system by:

* Adding new **crypto adapters** under `/crypto`
* Defining **custom queues** in `/queues`
* Implementing **new gRPC handlers** in `/grpc`
* Registering new **API routes** in `/routes`

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
