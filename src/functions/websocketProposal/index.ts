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
export const wsSubscribe = {
  handler: `${handlerPath(__dirname)}/handler.subscribeHandler`,
  timeout: 2, // seconds
  events: [
    {
      websocket: {
        route: 'subscribe_proposal',
      },
    },
  ],
};
