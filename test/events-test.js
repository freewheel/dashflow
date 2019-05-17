/* eslint-env node, mocha */
const { equal } = require("assert");
const events = require("../lib/events");

describe("events", () => {
  it("init", () => {
    const e = events.init();

    equal(e.length, 0);
    equal(e.head, null);
    equal(e.tail, null);

    equal(e.capacity, 1000000);
    equal(Object.keys(e.subscribers).length, 0);
  });
});
