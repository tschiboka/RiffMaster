const index = require("../index");



// describe('absolute', () => {
//     it("Should Return a Positive Number if Input is Positive", () => {
//         const result = index.absolute(1);
//         expect(result).toBe(1);
//     });
    
//     it("Should Return a Positive Number if Input is Zero", () => {
//         const result = index.absolute(0);
//         expect(result).toBe(0);
//     });
    
//     it("Should Return a Positive Number if Input is Negative", () => {
//         const result = index.absolute(-1);
//         expect(result).toBe(1);
//     });
// });



// describe("welcome", () => {
//     it("Should Return a Greeting Message", () => {
//         const result = index.welcome("Tibi");
//         expect(result).toMatch(/Welcome/);
//         expect(result).toContain("Tibi");
//     });
// });



// describe('getCurrencies', () => {
//     it("Should Return Supported Currencies", () => {
//         const result = index.getCurrencies();
//         expect(result).toBeDefined();                       // Too Specific
//         expect(result).not.toBeNull();

//         expect(result[0]).toBe("USD");                      // Too Strict
//         expect(result.length).toBe(4);                      

//         expect(result).toContain("USD");                    // Proper
//         expect(result).toContain("EUR");
//     });
// });



// describe('getProduct', () => { 
//     it("Should Return a Webshop Product", () => {
//         const result = index.getProduct(1);
//         expect(result).toEqual({ id: 1, price: 10 });       // Exact Number of Properties and Values
//         expect(result).toMatchObject({ id: 1, price: 10 }); // Match Only the Provided KV Pairs
//     });
// });


// describe('register', () => {
//     it("Should Throw Error if User Name is Falsy", () => {
//         [ null, undefined, "", false, NaN ].forEach(arg => {
//             expect(() => index.register(arg)).toThrow()
//         });
//     });

//     it("Should Return a User", () => {
//         const result = index.register(1);
//         expect(result).toMatchObject({ userName: "userName" });       // Exact Number of Properties and Values
//         expect(result.id).toBeGreaterThanOrEqual(0);
//     });
// });

const request = require("supertest");
let server;

describe('/api/users', () => {
    describe('GET/', () => {
        beforeEach(() => { server = index.server });
        afterEach(() => server.close());
        it("Should Return All Genres", async () => { 
            const res = await request(server).get("/api/users");
            expect(res.status).toBe(200);
         });
    });
        
});

