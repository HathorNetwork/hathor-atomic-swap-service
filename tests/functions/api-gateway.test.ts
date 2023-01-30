import { closeDbConnection, getDbConnection } from "@libs/db";
import { cleanDatabase, generateApiEvent, generateHandlerContext } from "../utils";
import { main as create } from "@functions/create/handler";
import * as service from "@functions/create/service";

const mySql = getDbConnection();

const dbMethodSpy = jest.spyOn(service, 'createProposalOnDb');

describe('error handling', () => {

  beforeEach(async () => {
    await cleanDatabase(mySql);
  })

  afterAll(async () => {
    await closeDbConnection(mySql);
  })

  it('should treat the response for a service failure', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw new Error('Service failure');
    })

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Service failure',
      }));
  })

  it('should treat the response for a badly formatted code error', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw 'Badly formatted failure';
    })

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual(expect.objectContaining({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Untreated error: Badly formatted failure',
      }));
  })

  it('should show the error stack trace on development environments', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw 'Badly formatted failure';
    })

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Untreated error: Badly formatted failure',
        stack: expect.any(String),
      });
  })

  it('should hide the error stack trace on non-development environments', async () => {
    const event = generateApiEvent();
    const context = generateHandlerContext();

    event['body'].authPassword = 'abc';

    // Mock
    dbMethodSpy.mockImplementationOnce(() => {
      throw 'Badly formatted failure';
    })

    const oldStage = process.env.STAGE;
    process.env.STAGE = '';

    // The type checker does not recognize the event type correctly
    // @ts-ignore
    const response = await create(event, context)
    process.env.STAGE = oldStage;

    expect(response.statusCode).toStrictEqual(500);
    expect(JSON.parse(response.body))
      .toStrictEqual({
        code: 'UNKNOWN_ERROR',
        errorMessage: 'Untreated error: Badly formatted failure',
      });
  })
})
