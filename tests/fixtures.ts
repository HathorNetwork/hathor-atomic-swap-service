/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { IValidatedAPIGatewayProxyEvent } from '../src/libs/api-gateway';
import { v4 } from 'uuid';

/**
 * Creates a Handler Context object, for use on tests invoking lambdas
 */
export function generateHandlerContext(): Context {
  return {
    awsRequestId: '',
    callbackWaitsForEmptyEventLoop: false,
    functionName: '',
    functionVersion: '',
    invokedFunctionArn: '',
    logGroupName: '',
    logStreamName: '',
    memoryLimitInMB: '',
    done(): void {
    },
    fail(): void {
    },
    getRemainingTimeInMillis(): number {
      return 1000; // Never times out. Overwrite if testing timeouts.
    },
    succeed(): void {
    },
  };
}

/**
 * Generates an HTTP event for testing
 */
// @ts-ignore
export const generateApiEvent = (): IValidatedAPIGatewayProxyEvent => {
  const baseEvent = {
    resource: '/',
    path: '/',
    httpMethod: 'GET',
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      cookie: 's_fid=7AAB6XMPLAFD9BBF-0643XMPL09956DE2; regStatus=pre-register',
      Host: '70ixmpl4fl.execute-api.us-east-2.amazonaws.com',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'upgrade-insecure-requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
      'X-Amzn-Trace-Id': 'Root=1-5e66d96f-7491f09xmpl79d18acf3d050',
      'X-Forwarded-For': '52.255.255.12',
      'X-Forwarded-Port': '443',
      'X-Forwarded-Proto': 'https'
    },
    multiValueHeaders: {
      accept: [
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      ],
      'accept-encoding': [
        'gzip, deflate, br'
      ],
      'accept-language': [
        'en-US,en;q=0.9'
      ],
      cookie: [
        's_fid=7AABXMPL1AFD9BBF-0643XMPL09956DE2; regStatus=pre-register;'
      ],
      Host: [
        '70ixmpl4fl.execute-api.ca-central-1.amazonaws.com'
      ],
      'sec-fetch-dest': [
        'document'
      ],
      'sec-fetch-mode': [
        'navigate'
      ],
      'sec-fetch-site': [
        'none'
      ],
      'upgrade-insecure-requests': [
        '1'
      ],
      'User-Agent': [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
      ],
      'X-Amzn-Trace-Id': [
        'Root=1-5e66d96f-7491f09xmpl79d18acf3d050'
      ],
      'X-Forwarded-For': [
        '52.255.255.12'
      ],
      'X-Forwarded-Port': [
        '443'
      ],
      'X-Forwarded-Proto': [
        'https'
      ]
    },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      resourceId: '2gxmpl',
      resourcePath: '/',
      httpMethod: 'GET',
      extendedRequestId: 'JJbxmplHYosFVYQ=',
      requestTime: '10/Mar/2020:00:03:59 +0000',
      path: '/Prod/',
      accountId: '123456789012',
      protocol: 'HTTP/1.1',
      stage: 'Prod',
      domainPrefix: '70ixmpl4fl',
      requestTimeEpoch: 1583798639428,
      requestId: '77375676-xmpl-4b79-853a-f982474efe18',
      identity: {
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        sourceIp: '52.255.255.12',
        principalOrgId: null,
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
        user: null
      },
      domainName: '70ixmpl4fl.execute-api.us-east-2.amazonaws.com',
      apiId: '70ixmpl4fl'
    },
    body: null,
    isBase64Encoded: false
  } as unknown as APIGatewayProxyEvent;
  return {
    ...baseEvent,
    body: {},
    rawBody: ''
  };
};

/**
 * Generates a websocket event for testing.
 * @param connectionId Optional identifier for the connection. Will generate a random one if empty
 */
export const generateWsEvent = (connectionId?: string) => {
  return {
    headers: {
      'Sec-WebSocket-Version': '13',
      'Sec-WebSocket-Key': 'TAdBcsTCOshLjv3Azgm2LQ==',
      Connection: 'Upgrade',
      Upgrade: 'websocket',
      'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
      Host: 'localhost:3002'
    },
    isBase64Encoded: false,
    multiValueHeaders: {
      'Sec-WebSocket-Version': [
        '13'
      ],
      'Sec-WebSocket-Key': [
        'TAdBcsTCOshLjv3Azgm2LQ=='
      ],
      Connection: [
        'Upgrade'
      ],
      Upgrade: [
        'websocket'
      ],
      'Sec-WebSocket-Extensions': [
        'permessage-deflate; client_max_window_bits'
      ],
      Host: [
        'localhost:3002'
      ]
    },
    requestContext: {
      apiId: 'private',
      connectedAt: 1683682431198,
      connectionId: connectionId || v4(),
      domainName: 'localhost',
      eventType: 'CONNECT',
      extendedRequestId: '7bcc3400-fdd3-4d1a-ab68-9b7c208aa9a7',
      identity: {
        accessKey: null,
        accountId: null,
        caller: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: null,
        userArn: null
      },
      messageDirection: 'IN',
      messageId: 'd759ccee-2fcc-445f-85cb-4a2c3322a0e8',
      requestId: 'b7dc36ef-5b4a-445b-9b1c-5b4b041783bc',
      requestTime: '09/May/2023:22:33:51 -0300',
      requestTimeEpoch: 1683682431198,
      routeKey: '$connect',
      stage: 'local'
    },
    mySql: {}
  };
};

export const subscribeWsEvent = (proposalId) => {
  return {
    body: `{"type":"subscribe_proposal","proposalId":"${proposalId || v4()}"}`,
    isBase64Encoded: false,
    requestContext: {
      apiId: 'private',
      connectedAt: 1684289660344,
      connectionId: 'f12ba0df-5163-43cf-8a40-e6a6b273e11d',
      domainName: 'localhost',
      eventType: 'MESSAGE',
      extendedRequestId: '6e863615-fde0-4faf-a0a5-c5dc4ced3cac',
      identity: {
        accessKey: null,
        accountId: null,
        caller: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: null,
        userArn: null
      },
      messageDirection: 'IN',
      messageId: '5a7f7e50-4178-4a3e-a786-bbcd530bf35b',
      requestId: '97181026-0a16-40da-a802-296bd3b97531',
      requestTime: '16/May/2023:23:17:09 -0300',
      requestTimeEpoch: 1684289829005,
      routeKey: 'subscribe_proposal',
      stage: 'local'
    },
    mySql: {}
  };
};
