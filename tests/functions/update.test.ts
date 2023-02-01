/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { closeDbConnection, getDbConnection } from '../../src/libs/db';
import { cleanDatabase, generateApiEvent, generateHandlerContext } from '../utils';
import { AUTHPASSWORD_HEADER_KEY } from '../../src/libs/constants';
import { main as update } from "@functions/update/handler";
import { createProposalOnDb } from '../../src/functions/create/service';
import { hashString } from '../../src/libs/util';
import { getProposalFromDb } from '../../src/functions/get/service';

const mySql = getDbConnection();

describe('inputs validation', () => {
  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should reject for a missing password', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    const response = await update(event, context)
    expect(response.statusCode).toStrictEqual(400);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'INVALID_PASSWORD',
        errorMessage: "Invalid password",
      }));
  })

  it('should reject for an invalid password', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();
    event.headers[AUTHPASSWORD_HEADER_KEY] = 'ab';

    const response = await update(event, context)
    expect(response.statusCode).toStrictEqual(400);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'INVALID_PASSWORD',
        errorMessage: "Invalid password",
      }));
  })

  it('should inform of a proposal not found', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();
    event.pathParameters = { proposalId: 'non-existent' };
    event.headers[AUTHPASSWORD_HEADER_KEY] = 'abc';

    const response = await update(event, context)
    expect(response.statusCode).toStrictEqual(404);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'PROPOSAL_NOT_FOUND',
        errorMessage: "Proposal not found",
      }));
  })

  it('should reject for an incorrect password', async () => {
    // Creating the proposal
    const { proposalId } = await createProposalOnDb(mySql, {
      partialTx: 'abc',
      authPassword: hashString('123'),
    });

    const event = generateApiEvent();
    const context = generateHandlerContext();
    event.pathParameters = { proposalId };
    event.headers[AUTHPASSWORD_HEADER_KEY] = '456';

    const response = await update(event, context)
    expect(response.statusCode).toStrictEqual(403);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'INCORRECT_PASSWORD',
        errorMessage: "Incorrect password",
      }));
  })

  it('should reject for a conflicting version', async () => {
    // Creating the proposal
    const password = '123';
    const { proposalId } = await createProposalOnDb(mySql, {
      partialTx: 'abc1',
      authPassword: hashString(password),
    });

    // Generating the request
    const event = generateApiEvent();
    const context = generateHandlerContext();
    event.pathParameters = { proposalId };
    event.headers[AUTHPASSWORD_HEADER_KEY] = password;
    event.body = { partialTx: 'abc2', version: 1 };
    const response = await update(event, context)

    // Validating the response
    expect(response.statusCode).toStrictEqual(409);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'VERSION_CONFLICT',
        errorMessage: "Version conflict",
      }));
  })
})

describe('successful updates', () => {
  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should update the proposal data', async () => {
    // Creating the proposal
    const password = '123';
    const { proposalId } = await createProposalOnDb(mySql, {
      partialTx: 'abc1',
      authPassword: hashString(password),
    });

    // Generating the request
    const event = generateApiEvent();
    const context = generateHandlerContext();
    event.pathParameters = { proposalId };
    event.headers[AUTHPASSWORD_HEADER_KEY] = password;
    event.body = { partialTx: 'abc2', version: 0 };
    const response = await update(event, context)

    // Validating the response
    expect(JSON.parse(response.body)).toStrictEqual({ success: true });
    expect(response.statusCode).toStrictEqual(200);

    // Validating the database
    const dbProposal = await getProposalFromDb(mySql, proposalId);
    expect(dbProposal).toStrictEqual({
      id: proposalId,
      partialTx: "abc2",
      signatures: null,
      timestamp: expect.any(String),
      version: 1,
      hashedAuthPassword: hashString(password),
      history: [
        {
          partialTx: "abc1",
          timestamp: expect.any(String),
        }
      ]
    })
  })

  it('should have the history in descending order', async () => {
    const updateWith = ({ partialTx, version }) => {

      // Generating the request
      const event = generateApiEvent();
      const context = generateHandlerContext();
      event.pathParameters = { proposalId };
      event.headers[AUTHPASSWORD_HEADER_KEY] = password;
      event.body = { partialTx, version };
      return update(event, context)
    }

    // Creating the proposal
    const password = '123';
    const { proposalId } = await createProposalOnDb(mySql, {
      partialTx: 'abc1',
      authPassword: hashString(password),
    });

    // Validating the response
    await updateWith({ partialTx: 'abc2', version: 0 });
    await updateWith({ partialTx: 'abc3', version: 1 });

    // Validating the database
    const dbProposal = await getProposalFromDb(mySql, proposalId);
    expect(dbProposal).toStrictEqual({
      id: proposalId,
      partialTx: "abc3",
      signatures: null,
      timestamp: expect.any(String),
      version: 2,
      hashedAuthPassword: hashString(password),
      history: [
        {
          partialTx: "abc2",
          timestamp: expect.any(String),
        },
        {
          partialTx: "abc1",
          timestamp: expect.any(String),
        }
      ]
    })
  })

  it('should have the history limited to 4', async () => {
    const updateWith = ({ partialTx, version }) => {

      // Generating the request
      const event = generateApiEvent();
      const context = generateHandlerContext();
      event.pathParameters = { proposalId };
      event.headers[AUTHPASSWORD_HEADER_KEY] = password;
      event.body = { partialTx, version };
      return update(event, context)
    }

    // Creating the proposal
    const password = '123';
    const { proposalId } = await createProposalOnDb(mySql, {
      partialTx: 'abc1',
      authPassword: hashString(password),
    });

    // Validating the response
    await updateWith({ partialTx: 'abc2', version: 0 });
    await updateWith({ partialTx: 'abc3', version: 1 });
    await updateWith({ partialTx: 'abc4', version: 2 });
    await updateWith({ partialTx: 'abc5', version: 3 });
    await updateWith({ partialTx: 'abc6', version: 4 });

    // Validating the database
    const dbProposal = await getProposalFromDb(mySql, proposalId);
    expect(dbProposal).toStrictEqual({
      id: proposalId,
      partialTx: "abc6",
      signatures: null,
      timestamp: expect.any(String),
      version: 5,
      hashedAuthPassword: hashString(password),
      history: [
        {
          partialTx: "abc5",
          timestamp: expect.any(String),
        },
        {
          partialTx: "abc4",
          timestamp: expect.any(String),
        },
        {
          partialTx: "abc3",
          timestamp: expect.any(String),
        },
        {
          partialTx: "abc2",
          timestamp: expect.any(String),
        }
      ]
    })
  })
})
