/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { handlerPath } from '@libs/handler-resolver';

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

export const wsDefault = {
  handler: `${handlerPath(__dirname)}/handler.defaultHandler`,
  timeout: 2, // seconds
  events: [
    {
      websocket: {
        route: '$default',
      },
    },
  ],
};
