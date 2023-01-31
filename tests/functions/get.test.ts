/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { closeDbConnection, getDbConnection } from '../../src/libs/db';
import { cleanDatabase, generateApiEvent, generateHandlerContext } from '../utils';
import { AUTHPASSWORD_HEADER_KEY } from '../../src/libs/constants';
import { main as get } from "@functions/get/handler";
import { createProposalOnDb } from '../../src/functions/create/service';
import { hashString } from '../../src/libs/util';

const mySql = getDbConnection();

describe('get a proposal', () => {
  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should reject for a missing password', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    const response = await get(event, context)
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

    const response = await get(event, context)
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

    const response = await get(event, context)
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

    const response = await get(event, context)
    expect(response.statusCode).toStrictEqual(403);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'INCORRECT_PASSWORD',
        errorMessage: "Incorrect password",
      }));
  })

  it('should return the proposal data', async () => {
    // Creating the proposal
    const { proposalId } = await createProposalOnDb(mySql, {
      partialTx: 'def',
      authPassword: hashString('234'),
    });

    const event = generateApiEvent();
    const context = generateHandlerContext();
    event.pathParameters = { proposalId };
    event.headers[AUTHPASSWORD_HEADER_KEY] = '234';

    const response = await get(event, context)
    expect(JSON.parse(response.body))
      .toStrictEqual({
        id: proposalId,
        partialTx: 'def',
        signatures: null,
        timestamp: expect.any(String),
        version: 0,
        history: []
      });
    expect(response.statusCode).toStrictEqual(200);
  })
})
