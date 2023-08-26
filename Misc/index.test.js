const index = require("../index");



const request = require("supertest");
let server;

describe('/api/users', () => {
    describe('GET/', () => {
        beforeEach(() => { server = index.server });
        afterEach(() => server.close());
        it("Should Return All Genres", async () => { 
            const res = await request(server).get("/api/users");
            expect(res.status).toBe(401);
         });
    });
        
});

