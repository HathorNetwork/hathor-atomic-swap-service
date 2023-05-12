/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from 'serverless-mysql';

export const cleanDatabase = async (mysql: ServerlessMysql): Promise<void> => {
  const TABLES = [
    'proposals',
    'websockets',
  ];
  await mysql.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of TABLES) {
    await mysql.query(`DELETE FROM ${table}`);
  }
  await mysql.query('SET FOREIGN_KEY_CHECKS = 1');
};
