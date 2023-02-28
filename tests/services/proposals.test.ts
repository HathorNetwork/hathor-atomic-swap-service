/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getProposalFromDb, IProposalSqlRow } from '../../src/services/proposals';
import { ServerlessMysql } from 'serverless-mysql';

describe('getProposalFromDb', () => {
  it('should process a correctly serialized history', async () => {
    const mockedSql = {
      query: jest.fn().mockImplementation((): IProposalSqlRow[] => {
        return [{
          proposal: 'mockedProposalId',
          hashed_auth_password: '123',
          auth_password_salt: '234',
          version: 0,
          partial_tx: 'bce',
          signatures: 'ced',
          history: '[{"partialTx":"abc1", "timestamp": "02-dec"}]',
          created_at: '01-dec',
          updated_at: '03-dec',
        }]
      })
    } as unknown as ServerlessMysql;

    const results = await getProposalFromDb(mockedSql, 'mockId');
    expect(results)
      .toStrictEqual({
        dbProposal: {
          id: 'mockedProposalId',
          partialTx: 'bce',
          signatures: 'ced',
          timestamp: '03-dec',
          version: 0,
          history: [{
            partialTx: 'abc1',
            timestamp: '02-dec'
          }],
        },
        dbProposalPasswordData: {
          hashedAuthPassword: '123',
          authPasswordSalt: '234',
        }
      });
  });

  it('should handle malformed history serialization errors', async () => {
    const mockedSql = {
      query: jest.fn().mockImplementation((): IProposalSqlRow[] => {
        return [{
          proposal: 'mockedProposalId',
          hashed_auth_password: '123',
          auth_password_salt: '234',
          version: 0,
          partial_tx: 'bce',
          signatures: 'ced',
          history: '[{partialTx":"abc1", "timestamp": "02-dec"}]', // Missing a "
          created_at: '01-dec',
          updated_at: '03-dec',
        }]
      })
    } as unknown as ServerlessMysql;

    const results = await getProposalFromDb(mockedSql, 'mockId');
    expect(results)
      .toStrictEqual({
        dbProposal: {
          id: 'mockedProposalId',
          partialTx: 'bce',
          signatures: 'ced',
          timestamp: '03-dec',
          version: 0,
          history: [],
        },
        dbProposalPasswordData: {
          hashedAuthPassword: '123',
          authPasswordSalt: '234',
        }
      });

    // TODO: When a logger is implemented, spy it and add a call assertion here
  })
})
