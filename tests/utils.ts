/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ServerlessMysql } from "serverless-mysql";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

export const cleanDatabase = async (mysql: ServerlessMysql): Promise<void> => {
    const TABLES = [
        'Proposals',
    ];
    await mysql.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES) {
        await mysql.query(`DELETE FROM ${table}`);
    }
    await mysql.query('SET FOREIGN_KEY_CHECKS = 1');
};


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
        done(): void {},
        fail(): void {},
        getRemainingTimeInMillis(): number {
            return 1000; // Never times out. Overwrite if testing timeouts.
        },
        succeed(): void {},
    };
}

// @ts-ignore
export const generateApiEvent = (): unknown => {
    const baseEvent = {
        "resource": "/",
        "path": "/",
        "httpMethod": "GET",
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9",
            "cookie": "s_fid=7AAB6XMPLAFD9BBF-0643XMPL09956DE2; regStatus=pre-register",
            "Host": "70ixmpl4fl.execute-api.us-east-2.amazonaws.com",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "upgrade-insecure-requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
            "X-Amzn-Trace-Id": "Root=1-5e66d96f-7491f09xmpl79d18acf3d050",
            "X-Forwarded-For": "52.255.255.12",
            "X-Forwarded-Port": "443",
            "X-Forwarded-Proto": "https"
        },
        "multiValueHeaders": {
            "accept": [
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
            ],
            "accept-encoding": [
                "gzip, deflate, br"
            ],
            "accept-language": [
                "en-US,en;q=0.9"
            ],
            "cookie": [
                "s_fid=7AABXMPL1AFD9BBF-0643XMPL09956DE2; regStatus=pre-register;"
            ],
            "Host": [
                "70ixmpl4fl.execute-api.ca-central-1.amazonaws.com"
            ],
            "sec-fetch-dest": [
                "document"
            ],
            "sec-fetch-mode": [
                "navigate"
            ],
            "sec-fetch-site": [
                "none"
            ],
            "upgrade-insecure-requests": [
                "1"
            ],
            "User-Agent": [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            ],
            "X-Amzn-Trace-Id": [
                "Root=1-5e66d96f-7491f09xmpl79d18acf3d050"
            ],
            "X-Forwarded-For": [
                "52.255.255.12"
            ],
            "X-Forwarded-Port": [
                "443"
            ],
            "X-Forwarded-Proto": [
                "https"
            ]
        },
        "queryStringParameters": null,
        "multiValueQueryStringParameters": null,
        "pathParameters": null,
        "stageVariables": null,
        "requestContext": {
            "resourceId": "2gxmpl",
            "resourcePath": "/",
            "httpMethod": "GET",
            "extendedRequestId": "JJbxmplHYosFVYQ=",
            "requestTime": "10/Mar/2020:00:03:59 +0000",
            "path": "/Prod/",
            "accountId": "123456789012",
            "protocol": "HTTP/1.1",
            "stage": "Prod",
            "domainPrefix": "70ixmpl4fl",
            "requestTimeEpoch": 1583798639428,
            "requestId": "77375676-xmpl-4b79-853a-f982474efe18",
            "identity": {
                "cognitoIdentityPoolId": null,
                "accountId": null,
                "cognitoIdentityId": null,
                "caller": null,
                "sourceIp": "52.255.255.12",
                "principalOrgId": null,
                "accessKey": null,
                "cognitoAuthenticationType": null,
                "cognitoAuthenticationProvider": null,
                "userArn": null,
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
                "user": null
            },
            "domainName": "70ixmpl4fl.execute-api.us-east-2.amazonaws.com",
            "apiId": "70ixmpl4fl"
        },
        "body": null,
        "isBase64Encoded": false
    } as unknown as APIGatewayProxyEvent
    return {
        ...baseEvent,
        body: {},
        rawBody: ''
    }
}
