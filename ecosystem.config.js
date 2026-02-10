module.exports = {
  apps: [{
    name: 'marketing-manager',
    script: 'server.js',
    cwd: '/home/node/app',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    restart_delay: 3000,
    max_restarts: 10
  }]
};
