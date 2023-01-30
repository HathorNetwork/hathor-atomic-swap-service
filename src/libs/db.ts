import serverlessMysql, { ServerlessMysql } from 'serverless-mysql';
import config from '../config';

/**
 * Get a database connection.
 *
 * @returns The database connection
 */
export const getDbConnection = (): ServerlessMysql => (
  serverlessMysql({
    // eslint-disable-next-line global-require
    library: require('mysql2'),
    config: config[process.env.NODE_ENV],
  })
);

export const closeDbConnection = async (mysql: ServerlessMysql): Promise<void> => {
  if (process.env.STAGE === 'local') {
    /*
         mysql.end() leaves the function hanging in the local environment. Some issues:
         https://github.com/jeremydaly/serverless-mysql/issues/61
         https://github.com/jeremydaly/serverless-mysql/issues/79

         It seems that's the expected behavior for local environment:
         https://github.com/serverless/serverless/issues/470#issuecomment-205372006
        */
    await mysql.quit();
  } else {
    await mysql.end();
  }
};
