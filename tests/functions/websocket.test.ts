import { cleanDatabase, generateWsContext, generateWsEvent } from '../utils';
import { closeDbConnection, getDbConnection } from '@libs/db';
import { connectHandler, disconnectHandler } from '@functions/websocket/handler';
import { v4 } from 'uuid';
import { initWsConnection } from '../../src/libs/websocket';

const mySql = getDbConnection();

describe('open a ws connection', () => {

  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
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

    // Asserting client response
    const response = await disconnectHandler(event, context);
    expect(response.statusCode).toStrictEqual(200);

    // Asserting persistent storage of the connection
    const sqlConnection = await mySql.query(`SELECT * FROM websockets where connection = 'nonexistent'`);
    expect(sqlConnection).toHaveLength(0);
  })

})
