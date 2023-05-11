import { connectionInfoFromEvent, sendMessageToClient } from '@libs/websocket';
import { generateWsEvent } from '../utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getDbConnection } from '../../src/libs/db';
import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';

const mySql = getDbConnection();

describe('connectionInfoFromEvent', () => {
  it('should return correct values when running in offline mode', () => {
    const oldEnv = process.env.IS_OFFLINE;

    process.env.IS_OFFLINE = 'true';
    const event = generateWsEvent('my-conn-id') as unknown as APIGatewayProxyEvent;
    let info = connectionInfoFromEvent(event);
    expect(info).toStrictEqual({
      id: 'my-conn-id',
      url: 'http://localhost:3002'
    })

    process.env.IS_OFFLINE = oldEnv;
  })

  it('should correctly return the configured domain', () => {
    const oldEnv = process.env.IS_OFFLINE;
    const oldDomain = process.env.WS_DOMAIN;

    process.env.IS_OFFLINE = '';
    process.env.WS_DOMAIN = 'configured-domain';
    const event = generateWsEvent('my-online-conn-id') as unknown as APIGatewayProxyEvent;
    let info = connectionInfoFromEvent(event);
    expect(info).toStrictEqual({
      id: 'my-online-conn-id',
      url: 'https://configured-domain'
    })

    process.env.IS_OFFLINE = oldEnv;
    process.env.WS_DOMAIN = oldDomain;
  })

  it('should throw if no domain was configured', () => {
    const oldEnv = process.env.IS_OFFLINE;
    const oldDomain = process.env.WS_DOMAIN;

    process.env.IS_OFFLINE = 'not-true';
    process.env.WS_DOMAIN = '';
    const event = generateWsEvent('my-online-conn-id') as unknown as APIGatewayProxyEvent;
    expect(() => connectionInfoFromEvent(event))
      .toThrow('[ALERT] Domain not on env variables')

    process.env.IS_OFFLINE = oldEnv;
    process.env.WS_DOMAIN = oldDomain;
  })
})

describe('sendMessageToClient', () => {

  it('should handle errors when sending', async () => {
    const connInfo = {
      id: 'fake',
      url: 'fake-url'
    };
    const payload = { fake: 'payload' };

    const sendSpy = jest.spyOn(ApiGatewayManagementApiClient.prototype, 'send')
      .mockImplementationOnce(async () => {
      throw new Error('Send message error');
    })

    await expect(sendMessageToClient(mySql, connInfo, payload))
      .rejects.toThrow('Send message error');

    sendSpy.mockRestore();
  })

  it('should close the connection when receiving a GONE response', async () => {
    const connInfo = {
      id: 'fake-conn-id',
      url: 'fake-url'
    };
    const payload = { fake: 'payload' };

    // Simulate the server informing that this client is gone
    const sendSpy = jest.spyOn(ApiGatewayManagementApiClient.prototype, 'send')
      .mockImplementationOnce(async () => {
      throw { statusCode: 410 };
    })
    const endSpy = jest.spyOn(mySql, 'query')

    // Assert the sendMessage does not throw
    const response = await sendMessageToClient(mySql, connInfo, payload)
    expect(response).toBeUndefined();

    // Assert that the connection identifier was deleted from the database
    expect(endSpy).toHaveBeenCalledWith(expect.stringContaining('DELETE'), ['fake-conn-id']);

    sendSpy.mockRestore();
    endSpy.mockRestore();
  })

  it('should return the AWS send results on success', async () => {
    const connInfo = {
      id: 'fake-conn-id',
      url: 'fake-url'
    };
    const payload = { fake: 'payload' };

    // Simulate the send success
    const successObj = { success: true };
    const sendSpy = jest.spyOn(ApiGatewayManagementApiClient.prototype, 'send')
      .mockImplementationOnce(async () => {
        return successObj
    })

    // Assert the sendMessage does not throw
    const response = await sendMessageToClient(mySql, connInfo, payload)
    expect(response).toBe(successObj);

    sendSpy.mockRestore();
  })
})
