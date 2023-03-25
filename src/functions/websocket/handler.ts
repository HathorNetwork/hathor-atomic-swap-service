/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import {
  connectionInfoFromEvent,
  sendMessageToClient,
  DEFAULT_API_GATEWAY_RESPONSE, endWsConnection, initWsConnection,
} from '@libs/websocket';
import { closeDbConnection, getDbConnection } from '@libs/db';
import { wrapWithConnection } from '@libs/lambda';

const mysql = getDbConnection();

export const connect = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const routeKey = event.requestContext.routeKey;
  // info needed to send response to client
  const connInfo = connectionInfoFromEvent(event);

  if (routeKey === '$connect') {
    await initWsConnection(mysql, connInfo);
  }

  if (routeKey === '$disconnect') {
    await endWsConnection(mysql, connInfo.id);
  }

  if (routeKey === 'ping') {
    await sendMessageToClient(mysql, connInfo, { type: 'pong' });
  }

  await closeDbConnection(mysql);

  return DEFAULT_API_GATEWAY_RESPONSE;
};

export const main = wrapWithConnection(connect);
