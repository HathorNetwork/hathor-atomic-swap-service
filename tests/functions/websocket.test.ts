import { cleanDatabase, generateWsContext, generateWsEvent } from '../utils';
import { closeDbConnection, getDbConnection } from '@libs/db';
import { connectHandler, disconnectHandler, pingHandler } from '@functions/websocket/handler';
import { v4 } from 'uuid';
import { initWsConnection } from '@libs/websocket';
import * as webSocketUtils from '@libs/websocket'
import { ApiError } from '../../src/libs/errors';

const mySql = getDbConnection();

const sendMessageSpy = jest
  .spyOn(webSocketUtils, 'sendMessageToClient')
  .mockImplementation(jest.fn());

describe('open a ws connection', () => {

  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should handle an exception and inform the client', async () => {
    const event = generateWsEvent();
    const context = generateWsContext();

    const initConnectionSpy = jest
      .spyOn(webSocketUtils, 'initWsConnection')
      .mockImplementation(() => Promise.reject(new Error('Sample error')));

    // Asserting client response
    const result = await connectHandler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(JSON.parse(result.body)).toStrictEqual(expect.objectContaining({
      code: ApiError.UnknownError,
      errorMessage: 'Sample error'
    }));

    // Asserting there is no persistent storage of the connection
    const sqlConnection = await mySql.query(`SELECT * FROM websockets`);
    expect(sqlConnection).toHaveLength(0);

    initConnectionSpy.mockRestore();
  })

  it('should create a new connection', async () => {
    const connectionId = v4(); // Generating a random connection id
    const event = generateWsEvent(connectionId);
    const context = generateWsContext();

    // Asserting client response
    const result = await connectHandler(event, context);
    expect(result.statusCode).toStrictEqual(200);

    // Asserting persistent storage of the connection
    const sqlConnection = await mySql.query(`SELECT * FROM websockets where connection = '${connectionId}'`);
    expect(sqlConnection).toHaveLength(1);
  })

})

describe('close a ws connection', () => {

  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should handle an exception and inform the client', async () => {
    const event = generateWsEvent();
    const context = generateWsContext();

    const endConnectionSpy = jest
      .spyOn(webSocketUtils, 'endWsConnection')
      .mockImplementation(() => Promise.reject(new Error('Sample disconnect error')));

    // Asserting client response
    const result = await disconnectHandler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(JSON.parse(result.body)).toStrictEqual(expect.objectContaining({
      code: ApiError.UnknownError,
      errorMessage: 'Sample disconnect error'
    }));

    // Asserting there is no persistent storage of the connection
    const sqlConnection = await mySql.query(`SELECT * FROM websockets`);
    expect(sqlConnection).toHaveLength(0);

    endConnectionSpy.mockRestore();
  })

  it('should close an existing connection', async () => {
    // Creating the connection on the database
    const connInfo = { id: v4(), url: 'http://test-url' };
    await initWsConnection(mySql, connInfo);

    const event = generateWsEvent(connInfo.id);
    const context = generateWsContext();

    // Asserting client response
    const response = await disconnectHandler(event, context);
    expect(response.statusCode).toStrictEqual(200);

    // Asserting persistent storage of the connection
    const sqlConnection = await mySql.query(`SELECT * FROM websockets where connection = '${connInfo.id}'`);
    expect(sqlConnection).toHaveLength(0);
  })

  it('should return success even for an nonexistent connection', async () => {
    const event = generateWsEvent();
    const context = generateWsContext();

    // Asserting there are no connections on the database
    const sqlConnection = await mySql.query(`SELECT * FROM websockets`);
    expect(sqlConnection).toHaveLength(0);

    // Asserting client response
    const response = await disconnectHandler(event, context);
    expect(response.statusCode).toStrictEqual(200);
  })

})

describe('ping request', () => {
  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should handle an exception and inform the client', async () => {
    const event = generateWsEvent();
    const context = generateWsContext();

    const connInfoSpy = jest
      .spyOn(webSocketUtils, 'connectionInfoFromEvent')
      .mockImplementation(() => {
        throw new Error('Sample ping error');
      });

    // Asserting client response
    const result = await connectHandler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(JSON.parse(result.body)).toStrictEqual(expect.objectContaining({
      code: ApiError.UnknownError,
      errorMessage: 'Sample ping error'
    }));

    connInfoSpy.mockRestore();
  })

  it('should respond with a pong', async () => {
    // Creating the connection on the database
    const connInfo = { id: v4(), url: 'http://test-url' };
    await initWsConnection(mySql, connInfo);

    const event = generateWsEvent(connInfo.id);
    const context = generateWsContext();

    // Asserting client response
    const response = await pingHandler(event, context);
    expect(response.statusCode).toStrictEqual(200);

    // Asserting persistent storage of the connection
    expect(sendMessageSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: connInfo.id }),
      { type: 'pong' }
    );
  })
})
