/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { handlerPath } from '@libs/handler-resolver';

/**
 * Websocket proposal subscription
 * Adds a connectionId as a listener to a specific proposalId
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

/**
 * Websocket proposal unsubscription
 * Removes a listener from a specific proposalId
 */
export const wsUnsubscribe = {
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
