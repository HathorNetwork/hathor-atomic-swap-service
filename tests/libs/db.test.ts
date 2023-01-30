import * as dbLib from "@libs/db";
const originalEnvSTAGE = process.env.STAGE

describe('closeDbConnection', () => {
    it('should quit on local stage', async () => {
        const dbConn = dbLib.getDbConnection();
        const quitSpy = jest.spyOn(dbConn, 'quit');
        const endSpy = jest.spyOn(dbConn, 'end');
        process.env.STAGE = 'local';

        dbLib.closeDbConnection(dbConn);
        expect(quitSpy).toHaveBeenCalledTimes(1);
        expect(endSpy).toHaveBeenCalledTimes(0);
        process.env.STAGE = originalEnvSTAGE;
    })

    it('should end on non-local stage', async () => {
        const dbConn = dbLib.getDbConnection();
        const quitSpy = jest.spyOn(dbConn, 'quit');
        const endSpy = jest.spyOn(dbConn, 'end');
        process.env.STAGE = 'something-else';

        dbLib.closeDbConnection(dbConn);
        expect(quitSpy).toHaveBeenCalledTimes(0);
        expect(endSpy).toHaveBeenCalledTimes(1);
        process.env.STAGE = originalEnvSTAGE;

        // Forcing quit on the connection, since it's still open
        dbConn.quit();
    })
})
