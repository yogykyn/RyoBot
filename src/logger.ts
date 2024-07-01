import fs from 'fs';
import pino from 'pino';

const LOGS_DIRECTORY_PATH = 'logs';
try {
  if (!fs.statSync(LOGS_DIRECTORY_PATH).isDirectory()) {
    fs.mkdirSync(LOGS_DIRECTORY_PATH, { recursive: true })
  }
} catch (e) {
  fs.mkdirSync(LOGS_DIRECTORY_PATH, { recursive: true })
}

export const Logger = pino();
