/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { handlerPath } from '@libs/handler-resolver';

/**
 * Websocket connection route
 * This will be the first route called by any client, registering the connection identifier
 * for future interactions with the Websocket Server.
 */
export const wsConnect = {
  handler: `${handlerPath(__dirname)}/handler.connectHandler`,
  timeout: 2, // seconds
  events: [
    {
      websocket: {
        route: '$connect',
      },
    },
  ],
};

/**
 * Websocket disconnection route
 * Removes all local references to the specified connection identifier, effectively closing
 * the connection.
 */
export const wsDisconnect = {
  handler: `${handlerPath(__dirname)}/handler.disconnectHandler`,
  timeout: 2, // seconds
  events: [
    {
      websocket: {
        route: '$disconnect',
      },
    },
  ],
};

/**
 * Websocket ping
 * This route provides the client with a static response that requires no processing,
 * allowing for a health check of the connection itself.
 */
export const wsPing = {
  handler: `${handlerPath(__dirname)}/handler.pingHandler`,
  timeout: 2, // seconds
  events: [
    {
      websocket: {
        route: 'ping',
      },
    },
  ],
};
