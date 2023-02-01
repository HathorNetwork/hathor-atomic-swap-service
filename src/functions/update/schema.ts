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
    signatures: { type: 'string' },
    version: { type: 'number' },
  },
  required: ['partialTx', 'version'],
} as const;
