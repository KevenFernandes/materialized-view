import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const getEnvVar = (key: string, valueDefault?: string) => {
  const value = process.env[key] || valueDefault;
  if (!value) {
    throw new Error(`Variável de ambiente ${key} não foi definida`);
  }
  return value;
};

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN'),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
};

export default config;
