import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';
import { ServerlessMysql } from 'serverless-mysql';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'>
  & {
  body: FromSchema<S>,
  /**
   * A MySql connection to be used by this request, managed by the api-gateway middleware
   */
  mySql: ServerlessMysql
}
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: Record<string, unknown>) => ({
  statusCode: 200,
  body: JSON.stringify(response),
});
