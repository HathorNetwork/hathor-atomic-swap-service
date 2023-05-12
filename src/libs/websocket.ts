/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import util from 'util';

import { WsConnectionInfo } from '@models/websocket';
import { ServerlessMysql } from 'serverless-mysql';

export const DEFAULT_API_GATEWAY_RESPONSE: APIGatewayProxyResult = {
  statusCode: 200,
  body: '',
};

/**
 * Extracts the connection identifier from the API Gateway proxy event,
 * and adds the url according to the current WS_DOMAIN configuration
 */
export const connectionInfoFromEvent = (
  event: APIGatewayProxyEvent,
): WsConnectionInfo => {
  const connID = event.requestContext.connectionId;

  // This will enter when running the service on serverless offline mode
  if (process.env.IS_OFFLINE === 'true') {
    return {
      id: connID,
      url: 'http://localhost:3002', // TODO: Fetch the port number from the config
    };
  }

  // Obtaining the domain URL from the server configurations
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

/**
 * Initializes a websocket connection by storing its identifier on the database
 */
export const initWsConnection = async (
  client: ServerlessMysql,
  connInfo: WsConnectionInfo,
): Promise<string> => {
  /* There is a small chance that the connectionId will be duplicated between $connect
   * requests. When this happens we can safely ignore the insert.
   */
  await client.query(
    `INSERT INTO websockets (connection, url)
              VALUES (?, ?)
              ON DUPLICATE KEY UPDATE connection = connection;`,
    [connInfo.id, connInfo.url],
  );

  return connInfo.id;
};

/**
 * Ends a websocket connection by removing its identifier from the database
 */
export const endWsConnection = async (
  client: ServerlessMysql,
  connectionId: string,
): Promise<void> => {
  await client.query(
    'DELETE FROM websockets WHERE connection = ?',
    [connectionId],
  );
};

/**
 * Sends a message to a websocket client through AWS
 */
export const sendMessageToClient = async (
  client: ServerlessMysql,
  connInfo: WsConnectionInfo,
  payload: any,
): Promise<any> => {
  const apiGwClient = new ApiGatewayManagementApiClient({
    apiVersion: '2018-11-29',
    endpoint: connInfo.url,
  });

  // For more complex data content than just Ascii characters, this Uint8Array type casting fails
  // TODO: Implement an actual conversion
  const command = new PostToConnectionCommand({
    ConnectionId: connInfo.id,
    Data: JSON.stringify(payload) as unknown as Uint8Array,
  });

  return apiGwClient.send(command).catch(
    (err) => {
      // http GONE(410) means client is disconnected, but still exists on our connection store
      if (err.statusCode === 410) {
        // cleanup connection and subscriptions from database if GONE
        return endWsConnection(client, connInfo.id);
      }
      throw err;
    },
  );
};
