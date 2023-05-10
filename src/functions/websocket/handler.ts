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

const connectFunction = async (event) => {
  // console.log(`\n${JSON.stringify(event)}\n`);
  const routeKey = event.requestContext.routeKey;
  // info needed to send response to client
  const connInfo = connectionInfoFromEvent(event);
  console.log(`Received ${routeKey} with connInfo ${JSON.stringify(connInfo)}`);

  await initWsConnection(event.mySql, connInfo);

  console.log(`Returned from "${routeKey}" successfully`);
  return DEFAULT_API_GATEWAY_RESPONSE;
};
export const connectHandler = middy(connectFunction)
  .use(sqlConnectionMiddleware())
  .use(errorHandlerMiddleware());

const disconnectFunction = async (event): Promise<APIGatewayProxyResult> => {
  // console.log(`\n${JSON.stringify(event)}\n`);
  const routeKey = event.requestContext.routeKey;
  // info needed to send response to client
  const connInfo = connectionInfoFromEvent(event);
  console.log(`Received ${routeKey} with connInfo ${JSON.stringify(connInfo)}`);

  await endWsConnection(event.mySql, connInfo.id);

  console.log(`Returned from "${routeKey}" successfully`);
  return DEFAULT_API_GATEWAY_RESPONSE;
};
export const disconnectHandler = middy(disconnectFunction)
  .use(sqlConnectionMiddleware())
  .use(errorHandlerMiddleware());

const pingFunction = async (event): Promise<APIGatewayProxyResult> => {
  // console.log(`\n${JSON.stringify(event)}\n`);
  const routeKey = event.requestContext.routeKey;
  // info needed to send response to client
  const connInfo = connectionInfoFromEvent(event);
  console.log(`Received ${routeKey} with connInfo ${JSON.stringify(connInfo)}`);

  await sendMessageToClient(event.mySql, connInfo, { type: 'pong' });

  console.log(`Returned from "${routeKey}" successfully`);
  return DEFAULT_API_GATEWAY_RESPONSE;
};
export const pingHandler = middy(pingFunction)
  .use(sqlConnectionMiddleware())
  .use(errorHandlerMiddleware());
