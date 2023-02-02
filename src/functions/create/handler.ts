/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { ICreateProposalRequest } from '@models/create';
import { createProposalOnDb } from '@services/proposals';
import { LambdaError } from '@libs/errors';
import createProposalSchema from './schema';

const create: ValidatedEventAPIGatewayProxyEvent<typeof createProposalSchema> = async (event) => {
  const {
    partialTx,
    authPassword,
  } = event.body as ICreateProposalRequest;
    // XXX: This is just to implement the error handling, but the schema should do this validation
  if (authPassword.length < 3) {
    throw new LambdaError('Invalid password', 'INVALID_PASSWORD');
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

export const main = middyfy(create);
