/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { closeDbConnection, getDbConnection } from '@libs/db';
import { cleanDatabase, generateApiEvent, generateHandlerContext } from '../utils';
import { main as create } from '@functions/createSwapProposal/handler';
import * as proposalService from '@services/proposals';
import { wrapWithErrorHandler } from '../../src/libs/lambda';
import { ApiError, LambdaError } from '../../src/libs/errors';

const mySql = getDbConnection();

const dbMethodSpy = jest.spyOn(proposalService, 'createProposalOnDb');

describe('connection wrapper handler', () => {

  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should treat the response for a service failure', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw new Error('Service failure');
    })

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Service failure',
      }));
  })

  it('should treat the response for a badly formatted code error', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw 'Badly formatted failure';
    })

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Untreated error: Badly formatted failure',
      }));
  })

  it('should show the error stack trace on development environments', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw 'Badly formatted failure';
    })

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Untreated error: Badly formatted failure',
        stack: expect.any(String),
      });
  })

  it('should hide the error stack trace on non-development environments', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw 'Badly formatted failure';
    })

    const oldStage = process.env.STAGE;
    process.env.STAGE = '';

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    process.env.STAGE = oldStage;

    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Untreated error: Badly formatted failure',
      });
  })
})

describe('no-connection wrapper handler', () => {

  it('should treat the response for a service failure', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw new Error('Service failure');
    })

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Service failure',
      }));
  })

  it('should treat the response for a handler failure', async () => {
    const testHandler = wrapWithErrorHandler(() => {
      throw new LambdaError('Connectionless error', ApiError.UnknownError);
    });

    const event = generateApiEvent();
    const context = generateHandlerContext();
    const response = await testHandler(event, context);

    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Connectionless error',
      }));
  })
})
