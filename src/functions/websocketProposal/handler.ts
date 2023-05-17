/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connectionInfoFromEvent, DEFAULT_API_GATEWAY_RESPONSE } from '@libs/websocket';
import middy from '@middy/core';
import wsJsonBodyParserMiddleware from '@middy/ws-json-body-parser';
import { errorHandlerMiddleware, sqlConnectionMiddleware } from '@libs/lambda';
import { subscribeToProposal } from '@services/ws-channels';
import { ApiError, LambdaError } from '@libs/errors';

/**
 * Handles the client connection requests to the websocket server
 */
const subscribeFunction = async (event) => {
  const connInfo = connectionInfoFromEvent(event);
  const { proposalId } = event.body;

  if (!proposalId) {
    throw new LambdaError('Missing mandatory parameter "proposalId"', ApiError.MissingParameter);
  }

  await subscribeToProposal(event.mySql, connInfo.id, proposalId);

  return DEFAULT_API_GATEWAY_RESPONSE;
};

export const subscribeHandler = middy(subscribeFunction)
  .use(wsJsonBodyParserMiddleware())
  .use(sqlConnectionMiddleware())
  .use(errorHandlerMiddleware());
