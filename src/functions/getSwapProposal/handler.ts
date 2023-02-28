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
import { LambdaError } from '@libs/errors';
import { AUTHPASSWORD_HEADER_KEY } from '@libs/constants';
import { getProposalFromDb } from '@services/proposals';

const getProposal: IValidatedEventAPIGatewayProxyEvent<Object> = async (event) => {
  const authPassword = event.headers[AUTHPASSWORD_HEADER_KEY] || '';
  if (authPassword.length < 3) {
    throw new LambdaError('Invalid password', 'INVALID_PASSWORD');
  }

  const proposalId = event.pathParameters.proposalId;
  const { dbProposal, dbProposalPasswordData } = await getProposalFromDb(event.mySql, proposalId);
  if (!dbProposal) {
    throw new LambdaError('Proposal not found', 'PROPOSAL_NOT_FOUND');
  }
  if (!validatePassword(authPassword, dbProposalPasswordData.hashedAuthPassword, dbProposalPasswordData.authPasswordSalt)) {
    throw new LambdaError('Incorrect password', 'INCORRECT_PASSWORD');
  }

  return formatJSONResponse(dbProposal);
};

export const main = wrapWithConnection(getProposal);
