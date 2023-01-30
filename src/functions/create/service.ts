/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from 'serverless-mysql';
import { v4 } from 'uuid';

export interface CreateProposalDbInputs {
    authPassword: string;
    partialTx: string;
    expiresAt?: Date;
}

export async function createProposalOnDb(mySql: ServerlessMysql, data: CreateProposalDbInputs) {
  const proposalId = v4();
  await mySql.query(
    `INSERT INTO Proposals
    (proposal, partial_tx, hashed_auth_password)
    VALUES(?, ?, ?);`,
    [proposalId, data.partialTx, data.authPassword],
  );

  return { proposalId };
}
