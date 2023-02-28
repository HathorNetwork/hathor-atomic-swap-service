/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import middy, { MiddlewareObj } from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import { closeDbConnection, getDbConnection } from '@libs/db';
import { ApiError, LambdaError, STATUS_CODE_TABLE } from '@libs/errors';
import { ServerlessMysql } from 'serverless-mysql';

const mySql = getDbConnection();

interface swapRequest extends middy.Request {
  event: {
    /**
     * A connection managed by the global error handler middleware
     */
    mySql?: ServerlessMysql,
    [key: string]: any,
  }
  error: LambdaError | Error,
}

const globalOnErrorHandler = async (request: middy.Request) => {
  // Close connections when a middleware has created them
  if (request.event.mySql) {
    await closeDbConnection(request.event.mySql);
  }

  let errorObj = request.error;
  if (!errorObj || !errorObj.message) {
    errorObj = new LambdaError(`Untreated error: ${errorObj}`);
  }

  const errorBody = {
    code: ApiError.UnknownError,
    errorMessage: errorObj.message,
    stack: undefined,
  };
  if (errorObj instanceof LambdaError) {
    errorBody.code = errorObj.code as ApiError;
  }
  if (process.env.STAGE === 'local') {
    errorBody.stack = errorObj.stack;
  }
  return {
    statusCode: STATUS_CODE_TABLE[errorBody.code],
    body: JSON.stringify(errorBody),
  };
};

const sqlConnectionMiddleware = () : MiddlewareObj => ({
  // Adds the MySQL connection to the handler context
  before: async (request: swapRequest) => {
    request.event.mySql = await mySql;
  },
  // Closes the connection of the handler context
  after: async (request: swapRequest) => {
    await closeDbConnection(request.event.mySql);
  },
  onError: globalOnErrorHandler,
});

const errorHandlerMiddleware = () : MiddlewareObj => ({
  onError: globalOnErrorHandler,
});

export const wrapWithConnection = (handler) => middy(handler)
  .use(middyJsonBodyParser())
  .use(sqlConnectionMiddleware());

export const wrapWithErrorHandler = (handler) => middy(handler)
  .use(middyJsonBodyParser())
  .use(errorHandlerMiddleware());
