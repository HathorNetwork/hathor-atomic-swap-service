/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { wrapWithConnection } from '@libs/lambda';

import { validatePassword } from '@libs/util';
import { ApiError, LambdaError } from '@libs/errors';
import { AUTHPASSWORD_HEADER_KEY } from '@libs/constants';
import { getProposalFromDb, updateProposalOnDb } from '@services/proposals';
import { IUpdateProposalRequest } from '@models/update';
import updateProposalSchema from './schema';

const update: IValidatedEventAPIGatewayProxyEvent<typeof updateProposalSchema> = async (event) => {
  const {
    partialTx,
    signatures,
    version,
  } = event.body as IUpdateProposalRequest;

  const authPassword = event.headers[AUTHPASSWORD_HEADER_KEY] || '';
  if (authPassword.length < 3) {
    throw new LambdaError('Invalid password', ApiError.InvalidPassword);
  }

  const proposalId = event.pathParameters.proposalId;
  const { dbProposal, dbProposalPasswordData } = await getProposalFromDb(event.mySql, proposalId);
  if (!dbProposal) {
    throw new LambdaError('Proposal not found', ApiError.ProposalNotFound);
  }
  if (!validatePassword(authPassword, dbProposalPasswordData.hashedAuthPassword, dbProposalPasswordData.authPasswordSalt)) {
    throw new LambdaError('Incorrect password', ApiError.IncorrectPassword);
  }

  if (version !== dbProposal.version) {
    throw new LambdaError('Version conflict', ApiError.VersionConflict);
  }

  await updateProposalOnDb(event.mySql, dbProposal, {
    partialTx,
    signatures,
  });

  return formatJSONResponse({ success: true });
};

export const main = wrapWithConnection(update);