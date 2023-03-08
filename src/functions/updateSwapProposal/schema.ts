/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Schema in the `json-schema-to-ts` format
 * @see https://www.npmjs.com/package/json-schema-to-ts
 */
export default {
  type: 'object',
  properties: {
    partialTx: { type: 'string' },
    signatures: { type: ['string', 'null'] },
    version: { type: 'number' },
  },
  required: ['partialTx', 'version'],
} as const;
