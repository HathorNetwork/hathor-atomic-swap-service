import { connectionInfoFromEvent } from '../../src/libs/websocket';
import { generateWsEvent } from '../utils';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('connectionInfoFromEvent', () => {
  it('should return correct values when offline', () => {
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
