/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from 'serverless-mysql';

/*
{
  id: '435af03c-fafc-47a6-9b16-33bcd77da76c',
  partialTx: '234BCD', // latest serialized proposal, encrypted
  signatures: '', // serialized signatures, encrypted
  timestamp: 234567, // version timestamp
  version: 1, // version count
  history: [
    { partialTx: '123ABC', timestamp: 123456 }, // previous version
  ]
}
 */

export interface IProposalSqlRow {
  proposal: string,
  hashed_auth_password: string,
  version: number,
  partial_tx: string,
  signatures: string,
  history: string,
  created_at: string,
  updated_at: string,
}

export interface IGetProposalFromDb {
  id: string,
  hashedAutoPassword: string,
  partialTx: string,
  signatures: string,
  timestamp: string,
  version: number,
  history: {partialTx: string, timestamp: string}[]
}

export async function getProposalFromDb(mySql: ServerlessMysql, proposalId: string) {
  const sqlRows: IProposalSqlRow[] = await mySql.query(
    `SELECT proposal, hashed_auth_password, version, partial_tx, signatures, history, updated_at 
          FROM Proposals
          WHERE proposal = ?`,
    [proposalId],
  );

  if (sqlRows.length === 0) {
    return null;
  }

  const sqlRow = sqlRows[0];
  const jsObject: IGetProposalFromDb = {
    id: sqlRow.proposal,
    hashedAutoPassword: sqlRow.hashed_auth_password,
    partialTx: sqlRow.partial_tx,
    signatures: sqlRow.signatures,
    timestamp: sqlRow.updated_at,
    version: sqlRow.version,
    history: [],
  };

  if (sqlRow.history?.length) {
    try {
      jsObject.history = JSON.parse(sqlRow.history);
    } catch (e) {
      console.error(`Unable to parse history for ${proposalId}`);
    }
  }

  return jsObject;
}
