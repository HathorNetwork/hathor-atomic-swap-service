/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from 'serverless-mysql';

export const cleanDatabase = async (mysql: ServerlessMysql): Promise<void> => {
  // Retrieving all available tables on the test database
  const tableNames = await mysql.query(
    `SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE'`
  ) as { TABLE_NAME: string }[];

  // Ensuring cascade deletions will work despite the order of the removals
  await mysql.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const { TABLE_NAME: table } of tableNames) {
    // Avoid cleaning the Sequelize metadata table, not involved in tests
    if (table === 'SequelizeMeta') {
      continue;
    }

    // Removing all data from each table
    await mysql.query(`DELETE FROM \`${table}\``);
  }

  // Restoring the cascade deletion protection
  await mysql.query('SET FOREIGN_KEY_CHECKS = 1');
};
