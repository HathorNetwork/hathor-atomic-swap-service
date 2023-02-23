/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface ICreateProposalRequest {
    partialTx: string;
    authPassword: string;
    expiresAt?: string;
}

export interface ICreateProposalResponse {
    success: boolean;
    id: string;
}
