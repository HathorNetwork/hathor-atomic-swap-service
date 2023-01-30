import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { ICreateProposalRequest } from '@models/create';
import { createProposalOnDb } from '@functions/create/service';
import { hashString } from '@libs/util';
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

  const hashedPassword = hashString(authPassword);

  const { proposalId } = await createProposalOnDb(event.mySql, {
    partialTx,
    authPassword: hashedPassword,
  });

  return formatJSONResponse({
    success: true,
    id: proposalId,
  });
};

export const main = middyfy(create);
