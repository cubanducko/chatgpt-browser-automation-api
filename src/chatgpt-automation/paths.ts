import path from 'path';

export function getDirname() {
  return __dirname;
}

export function getPlaywrightCacheFolder() {
  return path.join(__dirname, '../../.cache');
}
