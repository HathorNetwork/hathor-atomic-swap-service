/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { hashString } from '@libs/util';
import { LambdaError } from '@libs/errors';
import { AUTHPASSWORD_HEADER_KEY } from '@libs/constants';
import { getProposalFromDb } from '@functions/get/service';

const getProposal: ValidatedEventAPIGatewayProxyEvent<Object> = async (event) => {
  const authPassword = event.headers[AUTHPASSWORD_HEADER_KEY] || '';
  if (authPassword.length < 3) {
    throw new LambdaError('Invalid password', 'INVALID_PASSWORD');
  }
  const hashedPassword = hashString(authPassword);

  const proposalId = event.pathParameters.proposalId;
  const dbProposal = await getProposalFromDb(event.mySql, proposalId);
  if (!dbProposal) {
    throw new LambdaError('Proposal not found', 'PROPOSAL_NOT_FOUND');
  }
  if (hashedPassword !== dbProposal.hashedAutoPassword) {
    throw new LambdaError('Incorrect password', 'INCORRECT_PASSWORD');
  }

  const httpResponseObject = { ...dbProposal };
  delete httpResponseObject.hashedAutoPassword; // Removing data not on http contract

  return formatJSONResponse(httpResponseObject);
};

export const main = middyfy(getProposal);
