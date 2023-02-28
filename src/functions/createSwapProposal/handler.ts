/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { formatJSONResponse, IValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { wrapWithConnection } from '@libs/lambda';

import { ICreateProposalRequest } from '@models/create';
import { createProposalOnDb } from '@services/proposals';
import { ApiError, LambdaError } from '@libs/errors';
import createProposalSchema from './schema';

const create: IValidatedEventAPIGatewayProxyEvent<typeof createProposalSchema> = async (event) => {
  const {
    partialTx,
    authPassword,
  } = event.body as unknown as ICreateProposalRequest;
  if (authPassword.length < 3) {
    throw new LambdaError('Invalid password', ApiError.InvalidPassword);
  }

  const { proposalId } = await createProposalOnDb(event.mySql, {
    partialTx,
    authPassword,
  });

  return formatJSONResponse({
    success: true,
    id: proposalId,
  });
};

export const main = wrapWithConnection(create);
