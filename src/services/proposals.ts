/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from 'serverless-mysql';
import { v4 } from 'uuid';
import { hashPassword } from '@libs/util';

export interface CreateProposalDbInputs {
  authPassword: string;
  partialTx: string;
  expiresAt?: Date;
}

export async function createProposalOnDb(mySql: ServerlessMysql, data: CreateProposalDbInputs) {
  const proposalId = v4();
  const { hashedPass, salt } = hashPassword(data.authPassword);

  await mySql.query(
    `INSERT INTO proposals (proposal
                                , partial_tx
                                , hashed_auth_password
                                , auth_password_salt)
              VALUES(?, ?, ?, ?);`,
    [proposalId, data.partialTx, hashedPass, salt],
  );

  return { proposalId };
}

export interface IProposalSqlRow {
  proposal: string,
  hashed_auth_password: string,
  auth_password_salt: string,
  version: number,
  partial_tx: string,
  signatures: string,
  history: string,
  created_at: string,
  updated_at: string,
}

export interface IGetProposalFromDb {
  id: string,
  hashedAuthPassword: string,
  authPasswordSalt: string,
  partialTx: string,
  signatures: string,
  timestamp: string,
  version: number,
  history: {partialTx: string, timestamp: string}[]
}

export async function getProposalFromDb(mySql: ServerlessMysql, proposalId: string) {
  const sqlRows: IProposalSqlRow[] = await mySql.query(
    `SELECT proposal
                 , hashed_auth_password
                 , auth_password_salt
                 , version
                 , partial_tx
                 , signatures
                 , history
                 , updated_at 
            FROM proposals
            WHERE proposal = ?`,
    [proposalId],
  );

  if (sqlRows.length === 0) {
    return null;
  }

  const sqlRow = sqlRows[0];
  const jsObject: IGetProposalFromDb = {
    id: sqlRow.proposal,
    hashedAuthPassword: sqlRow.hashed_auth_password,
    authPasswordSalt: sqlRow.auth_password_salt,
    partialTx: sqlRow.partial_tx,
    signatures: sqlRow.signatures,
    timestamp: sqlRow.updated_at.toString(),
    version: sqlRow.version,
    history: [],
  };

  if (sqlRow.history?.length) {
    try {
      jsObject.history = JSON.parse(sqlRow.history);
    } catch (e) {
      // TODO: Implement a logger here to avoid using just the console
      // eslint-disable-next-line no-console
      console.error(`Unable to parse history for ${proposalId}`);
    }
  }

  return jsObject;
}
