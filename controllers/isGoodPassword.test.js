const isGoodPassword = require('./isGoodPassword.js')

test("Testing a short password ", () => {
    expect(isGoodPassword("abcdef")).toBe(false);
})


test("Testing a good password", () => {
    expect(isGoodPassword("AuBespxv1")).toBe(true);
})


test("Testing a lenthy but insecure password", () => {
    expect(isGoodPassword("helloworld")).toBe(false);
})

test("Testing a password without capitalized letter", () => {
    expect(isGoodPassword("rsxnbtyspqk1")).toBe(false);
})