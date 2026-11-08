import app from './app.js';
import config from './config/index.js';
import './db/database.js';

const server = app.listen(config.port, () => {
  console.log(`
  =====================================
     WEATHER DASHBOARD API
  =====================================
     Server: http://localhost:${config.port}
     Health: http://localhost:${config.port}/api/health
  =====================================
  `);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use.`);
  } else {
    console.error('Server startup error:', error);
  }

  process.exit(1);
});

function shutdown() {
  console.log('\nShutting down server...');

  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);