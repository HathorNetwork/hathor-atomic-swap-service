/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ServerlessMysql } from 'serverless-mysql';

export async function listenToProposal(mySql : ServerlessMysql, connectionId: string, proposalId: string) {
  await mySql.query(
    `INSERT INTO "websockets-proposals" (
                                  connection
                                , proposal)
              VALUES(?, ?);`,
    [connectionId, proposalId],
  );
}

export async function removeListenedProposal(mySql : ServerlessMysql, connectionId: string, proposalId: string) {
  await mySql.query(
    `DELETE FROM "websockets-proposals"
           WHERE connection = ?
             AND proposal = ?`,
    [connectionId, proposalId],
  );
}

export async function removeConnectionFromListeners(mySql : ServerlessMysql, connectionId: string) {
  await mySql.query(
    `DELETE FROM "websockets-proposals"
           WHERE connection = ?`,
    [connectionId],
  );
}

export async function removeProposalFromListeners(mySql : ServerlessMysql, proposalId: string) {
  await mySql.query(
    `DELETE FROM "websockets-proposals"
           WHERE proposal = ?`,
    [proposalId],
  );
}
