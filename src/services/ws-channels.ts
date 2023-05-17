/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ServerlessMysql } from 'serverless-mysql';
import { WsConnectionInfo, WsUpdatePayload } from '@models/websocket';
import { IDbProposal } from '@services/proposals';

export async function subscribeToProposal(mySql : ServerlessMysql, connectionId: string, proposalId: string) {
  await mySql.query(
    `INSERT INTO \`websockets-proposals\` (
                                  connection
                                , proposal)
              VALUES(?, ?);`,
    [connectionId, proposalId],
  );
}

export async function unsubscribeFromProposal(mySql : ServerlessMysql, connectionId: string, proposalId: string) {
  await mySql.query(
    `DELETE FROM \`websockets-proposals\`
           WHERE connection = ?
             AND proposal = ?`,
    [connectionId, proposalId],
  );
}

export async function unsubscribeAllForProposal(mySql : ServerlessMysql, connectionId: string) {
  await mySql.query(
    `DELETE FROM \`websockets-proposals\`
           WHERE connection = ?`,
    [connectionId],
  );
}

export async function unsubscribeAllForConnection(mySql : ServerlessMysql, proposalId: string) {
  await mySql.query(
    `DELETE FROM \`websockets-proposals\`
           WHERE proposal = ?`,
    [proposalId],
  );
}

export async function getProposalSubscribers(mySql : ServerlessMysql, proposalId: string) : Promise<WsConnectionInfo[]> {
  const sqlResponse: { connection: string, url: string }[] = await mySql.query(
    `SELECT w.connection, w.url 
  FROM \`websockets-proposals\` wp
  INNER JOIN websockets w ON w.\`connection\` = wp.\`connection\` 
  WHERE wp.proposal = ?`,
    [proposalId],
  );

  // Converting to the expected interface
  return sqlResponse.map((row) => ({
    id: row.connection,
    url: row.url,
  }));
}

export function generateSubscriptionMessagePayload(proposal: IDbProposal): WsUpdatePayload {
  return {
    id: proposal.id,
    partialTx: proposal.partialTx,
    signatures: proposal.signatures,
    timestamp: proposal.timestamp,
    version: proposal.version,
  };
}
