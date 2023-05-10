import { cleanDatabase, generateWsContext, generateWsEvent } from '../utils';
import { closeDbConnection, getDbConnection } from '@libs/db';
import { connectHandler } from '@functions/websocket/handler';
import { v4 } from 'uuid';

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
