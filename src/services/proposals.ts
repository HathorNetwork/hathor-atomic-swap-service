/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from 'serverless-mysql';
import { v4 } from 'uuid';
import { hashPassword } from '@libs/util';
import { ApiError, LambdaError } from '@libs/errors';
import { MAX_HISTORY_LENGTH } from '@libs/constants';

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

export interface IDbProposal {
  id: string,
  partialTx: string,
  signatures: string,
  timestamp: string,
  version: number,
  history: {partialTx: string, timestamp: string}[]
}

export interface IDbProposalPasswordData {
  hashedAuthPassword: string,
  authPasswordSalt: string,
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
    return { dbProposal: null, dbProposalPasswordData: null };
  }
  if (sqlRows.length > 1) {
    throw new LambdaError(`Multiple proposals found for id: ${proposalId}`, ApiError.DuplicateProposalId);
  }

  const sqlRow = sqlRows[0];
  const dbProposal: IDbProposal = {
    id: sqlRow.proposal,
    partialTx: sqlRow.partial_tx,
    signatures: sqlRow.signatures,
    timestamp: sqlRow.updated_at.toString(),
    version: sqlRow.version,
    history: [],
  };
  const dbProposalPasswordData : IDbProposalPasswordData = {
    hashedAuthPassword: sqlRow.hashed_auth_password,
    authPasswordSalt: sqlRow.auth_password_salt,
  };

  if (sqlRow.history?.length) {
    try {
      dbProposal.history = JSON.parse(sqlRow.history);
    } catch (e) {
      // TODO: Implement a logger here to avoid using just the console
      // eslint-disable-next-line no-console
      console.error(`Unable to parse history for ${proposalId}`);
      // TODO: Implement call to Alerts Manager as well
    }
  }

  return { dbProposal, dbProposalPasswordData };
}

export interface IUpdateProposalDbInputs {
  partialTx: string,
  signatures?: string,
}

export async function updateProposalOnDb(mySql: ServerlessMysql, current: IDbProposal, updateData: IUpdateProposalDbInputs) {
  const proposalId = current.id;

  // Checking if there was a change on the proposal data, or only on its signatures
  let newHistory: IDbProposal['history'] | undefined;
  if (current.partialTx !== updateData.partialTx) {
    newHistory = [
      { partialTx: current.partialTx, timestamp: current.timestamp },
      ...current.history,
    ].slice(0, MAX_HISTORY_LENGTH);
  }

  const mySqlQuery = `UPDATE proposals
                         SET version = version + 1
                             , partial_tx = ?
                             , signatures = ?
                             ${newHistory ? ', history = ?' : ''} 
                             , updated_at = CURRENT_TIMESTAMP
                       WHERE proposal = ?`;
  const updateArray = newHistory
    ? [updateData.partialTx, updateData.signatures, JSON.stringify(newHistory), proposalId]
    : [updateData.partialTx, updateData.signatures, proposalId];

  return mySql.query(mySqlQuery, updateArray);
}
