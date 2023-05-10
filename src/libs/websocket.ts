/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { ApiGatewayManagementApiClient, PostToConnectionCommand, DeleteConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import util from 'util';

import { WsConnectionInfo } from '@models/websocket';
import { ServerlessMysql } from 'serverless-mysql';

export const DEFAULT_API_GATEWAY_RESPONSE: APIGatewayProxyResult = {
  statusCode: 200,
  body: '',
};

export const connectionInfoFromEvent = (
  event: APIGatewayProxyEvent,
): WsConnectionInfo => {
  const connID = event.requestContext.connectionId;
  if (process.env.IS_OFFLINE === 'true') {
    // This will enter when running the service on serverless offline mode
    return {
      id: connID,
      url: 'http://localhost:3002', // TODO: Fetch the port number from the config
    };
  }

  const domain = process.env.WS_DOMAIN;

  if (!domain) {
    // Throw so we receive an alert telling us that something is wrong with the env variable
    // instead of trying to invoke a lambda at https://undefined
    throw new Error('[ALERT] Domain not on env variables');
  }

  return {
    id: connID,
    url: util.format('https://%s', domain),
  };
};

export const initWsConnection = async (
  client: ServerlessMysql,
  connInfo: WsConnectionInfo,
): Promise<string> => {
  await client.query(
    `INSERT INTO websockets (connection, url)
              VALUES (?, ?)
              ON DUPLICATE KEY UPDATE url = ?;`,
    [connInfo.id, connInfo.url, connInfo.url],
  );

  return connInfo.id;
};
export const endWsConnection = async (
  client: ServerlessMysql,
  connectionId: string,
): Promise<void> => {
  await client.query(
    'DELETE FROM websockets WHERE connection = ?',
    [connectionId],
  );
};
export const sendMessageToClient = async (
  client: ServerlessMysql,
  connInfo: WsConnectionInfo,
  payload: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log(`sendMessageToClient requested with ${JSON.stringify(connInfo)}, msg: ${JSON.stringify(payload)}`);

  const apiGwClient = new ApiGatewayManagementApiClient({
    apiVersion: '2018-11-29',
    endpoint: connInfo.url,
  });
  const command = new PostToConnectionCommand({
    ConnectionId: connInfo.id,
    Data: JSON.stringify(payload) as unknown as Uint8Array,
  });

  return apiGwClient.send(command).catch(
    (err) => {
      // http GONE(410) means client is disconnected, but still exists on our connection store
      if (err.statusCode === 410) {
        // cleanup connection and subscriptions from redis if GONE
        return endWsConnection(client, connInfo.id);
      }
      throw err;
    },
  );
};

export const disconnectClient = async (
  client: ServerlessMysql,
  connInfo: WsConnectionInfo,
): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const apiGwClient = new ApiGatewayManagementApiClient({
    apiVersion: '2018-11-29',
    endpoint: connInfo.url,
  });
  const command = new DeleteConnectionCommand({
    ConnectionId: connInfo.id,
  });

  return apiGwClient.send(command).catch(
    (err) => {
      // http GONE(410) means client is disconnected, but still exists on our connection store
      if (err.statusCode === 410) {
        // cleanup connection and subscriptions from redis if GONE
        return endWsConnection(client, connInfo.id);
      }
      throw err;
    },
  );
};