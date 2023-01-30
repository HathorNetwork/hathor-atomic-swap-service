require('dotenv').config();

export default {
  development: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: '127.0.0.1',
    port: process.env.DB_PORT || 3306,
  },
  test: {
    user: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: process.env.CI_DB_HOST || '127.0.0.1',
    port: process.env.CI_DB_PORT || 3306,
  },
  production: {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_ENDPOINT,
    port: process.env.DB_PORT,
  },
};
