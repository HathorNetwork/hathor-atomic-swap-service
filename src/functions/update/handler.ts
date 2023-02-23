/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { wrapWithConnection } from '@libs/lambda';

import { validatePassword } from '@libs/util';
import { LambdaError } from '@libs/errors';
import { AUTHPASSWORD_HEADER_KEY } from '@libs/constants';
import { getProposalFromDb, updateProposalOnDb } from '@services/proposals';
import { IUpdateProposalRequest } from '@models/update';
import updateProposalSchema from './schema';

const update: ValidatedEventAPIGatewayProxyEvent<typeof updateProposalSchema> = async (event) => {
  const {
    partialTx,
    signatures,
    version,
  } = event.body as IUpdateProposalRequest;

  const authPassword = event.headers[AUTHPASSWORD_HEADER_KEY] || '';
  if (authPassword.length < 3) {
    throw new LambdaError('Invalid password', 'INVALID_PASSWORD');
  }

  const proposalId = event.pathParameters.proposalId;
  const dbProposal = await getProposalFromDb(event.mySql, proposalId);
  if (!dbProposal) {
    throw new LambdaError('Proposal not found', 'PROPOSAL_NOT_FOUND');
  }
  if (!validatePassword(authPassword, dbProposal.hashedAuthPassword, dbProposal.authPasswordSalt)) {
    throw new LambdaError('Incorrect password', 'INCORRECT_PASSWORD');
  }

  if (version !== dbProposal.version) {
    throw new LambdaError('Version conflict', 'VERSION_CONFLICT');
  }

  await updateProposalOnDb(event.mySql, dbProposal, {
    partialTx,
    signatures,
  });

  return formatJSONResponse({ success: true });
};

export const main = wrapWithConnection(update);
