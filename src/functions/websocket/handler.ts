/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  APIGatewayProxyResult,
} from 'aws-lambda';
import {
  connectionInfoFromEvent,
  sendMessageToClient,
  DEFAULT_API_GATEWAY_RESPONSE, endWsConnection, initWsConnection,
} from '@libs/websocket';
import middy from '@middy/core';
import { errorHandlerMiddleware, sqlConnectionMiddleware } from '@libs/lambda';

/**
 * Handles the client connection requests to the websocket server
 */
const connectFunction = async (event) => {
  const connInfo = connectionInfoFromEvent(event);
  await initWsConnection(event.mySql, connInfo);

  return DEFAULT_API_GATEWAY_RESPONSE;
};

export const connectHandler = middy(connectFunction)
  .use(sqlConnectionMiddleware())
  .use(errorHandlerMiddleware());

/**
 * Handles the client connection finishing requests to the websocket server
 */
const disconnectFunction = async (event): Promise<APIGatewayProxyResult> => {
  const connInfo = connectionInfoFromEvent(event);
  await endWsConnection(event.mySql, connInfo.id);

  return DEFAULT_API_GATEWAY_RESPONSE;
};

export const disconnectHandler = middy(disconnectFunction)
  .use(sqlConnectionMiddleware())
  .use(errorHandlerMiddleware());

/**
 * Handles the client ping requests, validating the health of the websocket connection
 */
const pingFunction = async (event): Promise<APIGatewayProxyResult> => {
  const connInfo = connectionInfoFromEvent(event);
  await sendMessageToClient(event.mySql, connInfo, { type: 'pong' });

  return DEFAULT_API_GATEWAY_RESPONSE;
};

export const pingHandler = middy(pingFunction)
  .use(sqlConnectionMiddleware())
  .use(errorHandlerMiddleware());
