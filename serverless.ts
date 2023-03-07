/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AWS } from '@serverless/typescript';
import create from '@functions/createSwapProposal';
import get from '@functions/getSwapProposal';
import update from '@functions/updateSwapProposal';

require('dotenv').config();

const serverlessConfiguration: AWS = {
  service: 'hathor-atomic-swap-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      NODE_ENV: '${env:NODE_ENV}',
      DB_USER: '${env:DB_USER}',
      DB_PASS: '${env:DB_PASS}',
      DB_ENDPOINT: '${env:DB_ENDPOINT}',
      DB_NAME: '${env:DB_NAME}',
      DB_PORT: '${env:DB_PORT}',
    },
    vpc: {
      securityGroupIds: [
        process.env.AWS_VPC_DEFAULT_SG_ID
      ],
      subnetIds: [
        process.env.AWS_SUBNET_ID_1,
        process.env.AWS_SUBNET_ID_2,
        process.env.AWS_SUBNET_ID_3,
      ]
    }
  },
  // import the function via paths
  functions: { create, get, update },
  package: { individually: true },
  custom: {
    stage: '${opt:stage, "dev"}',
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-offline': {
      httpPort: process.env.HTTP_PORT || 3001,
    },
  },
};

module.exports = serverlessConfiguration;
