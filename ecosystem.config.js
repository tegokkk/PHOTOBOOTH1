const path = require('path');

module.exports = {
  apps: [
    {
      name: "ririi-backend",
      script: "npm",
      args: "run start",
      cwd: "./backend",
      env: {
        NODE_ENV: "production",
        PORT: Number(process.env.BACKEND_PORT || 5000),
        FRONTEND_URL: process.env.FRONTEND_URL,
        TRUST_PROXY: process.env.TRUST_PROXY || "1",
      },
      watch: false,
      autorestart: true,
      kill_timeout: 10000,
      listen_timeout: 10000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: '1G',
      error_file: path.join(__dirname, "backend", "logs", "backend-error.log"),
      out_file: path.join(__dirname, "backend", "logs", "backend-out.log"),
      merge_logs: true,
      time: true
    },
    {
      name: "ririi-frontend",
      script: "npm",
      args: "run start",
      cwd: "./frontend",
      env: {
        NODE_ENV: "production",
        PORT: Number(process.env.FRONTEND_PORT || 3000),
      },
      watch: false,
      autorestart: true,
      kill_timeout: 10000,
      listen_timeout: 10000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: '1G',
      error_file: path.join(__dirname, "frontend", "logs", "frontend-error.log"),
      out_file: path.join(__dirname, "frontend", "logs", "frontend-out.log"),
      merge_logs: true,
      time: true
    }
  ]
};
