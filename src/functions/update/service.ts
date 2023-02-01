/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from 'serverless-mysql';
import { IGetProposalFromDb } from '@functions/get/service';
import { MAX_HISTORY_LENGTH } from '@libs/constants';

export interface IUpdateProposalDbInputs {
  partialTx: string,
  signatures?: string,
}

export async function updateProposalOnDb(mySql: ServerlessMysql, current: IGetProposalFromDb, updateData: IUpdateProposalDbInputs) {
  const proposalId = current.id;

  // Checking if there was a change on the proposal data, or only on its signatures
  let newHistory: IGetProposalFromDb['history'] | undefined;
  if (current.partialTx !== updateData.partialTx) {
    newHistory = [
      { partialTx: current.partialTx, timestamp: current.timestamp },
      ...current.history,
    ].slice(0, MAX_HISTORY_LENGTH);
  }

  const mySqlQuery = `UPDATE Proposals
SET version=version+1, 
  partial_tx=?, 
  signatures=?, 
  ${newHistory ? 'history=?,' : ''} 
  updated_at=CURRENT_TIMESTAMP
WHERE proposal=?;
`;
  const updateArray = newHistory
    ? [updateData.partialTx, updateData.signatures, JSON.stringify(newHistory), proposalId]
    : [updateData.partialTx, updateData.signatures, proposalId];

  return mySql.query(mySqlQuery, updateArray);
}
