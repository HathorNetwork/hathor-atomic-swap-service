/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum ApiError {
  ProposalNotFound = 'PROPOSAL_NOT_FOUND',
  DuplicateProposalId = 'DUPLICATE_PROPOSAL_ID',
  InvalidPassword = 'INVALID_PASSWORD',
  IncorrectPassword = 'INCORRECT_PASSWORD',
  UnknownError = 'UNKNOWN_ERROR',
}

export const STATUS_CODE_TABLE = {
  PROPOSAL_NOT_FOUND: 404,
  DUPLICATE_PROPOSAL_ID: 500,
  INVALID_PASSWORD: 400,
  INCORRECT_PASSWORD: 403,
  UNKNOWN_ERROR: 500,
} as const;

export class LambdaError extends Error {
  code: string;

  constructor(message, code: ApiError = ApiError.UnknownError) {
    super(message);
    this.code = code;
  }
}
