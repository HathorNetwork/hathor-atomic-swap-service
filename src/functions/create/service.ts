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
