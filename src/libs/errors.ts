/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Enum-like list of possible API Errors
 */
export type ApiError =
  'PROPOSAL_NOT_FOUND' |
  'INVALID_PASSWORD' |
  'INCORRECT_PASSWORD' |
  'VERSION_CONFLICT' |
  'UNKNOWN_ERROR'

export const STATUS_CODE_TABLE = {
  PROPOSAL_NOT_FOUND: 404,
  INVALID_PASSWORD: 400,
  INCORRECT_PASSWORD: 403,
  VERSION_CONFLICT: 409,
  UNKNOWN_ERROR: 500,
} as const;

export class LambdaError extends Error {
  code: string;

  constructor(message, code: ApiError = 'UNKNOWN_ERROR') {
    super(message);
    this.code = code;
  }
}
