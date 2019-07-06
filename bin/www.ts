#!/usr/bin/env node
import server from '../app';
import { logger } from '../share/logger';

interface Error {
  syscall: string;
  code: string;
}

server.on('error', function (error: Error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error('requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error('port is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', onListening);

function onListening () {
  logger.trace('Listening on ', server.address());
}
