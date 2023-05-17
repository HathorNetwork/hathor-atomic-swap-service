/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Structure to store the connection information of a given client, extracted from the request event.
 * @see connectionInfoFromEvent
 */
export type WsConnectionInfo = {
  id: string;
  url: string;
}
