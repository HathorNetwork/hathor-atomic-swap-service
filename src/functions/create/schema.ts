/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default {
  type: 'object',
  properties: {
    partialTx: { type: 'string' },
    authPassword: { type: 'string' },
    expiresAt: { type: 'Date' },
  },
  required: ['partialTx', 'authPassword'],
} as const;
