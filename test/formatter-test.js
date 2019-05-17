/* eslint-env node, mocha */
const { equal } = require("assert");
const {
  shellFormatter,
  watchFormatter,
  commandFormatter,
  restartFormatter,
  smartUnformat,
} = require("../lib/formatter");

describe("formatter", () => {
  it("format shell", () => {
    equal(
      shellFormatter.format("yarn lint", "stdout", "lint passing"),
      "shell:yarn lint:stdout:lint passing"
    );
  });

  it("unformat shell", () => {
    equal(
      shellFormatter.unformat("shell:yarn lint:stdout:lint passing"),
      "lint passing"
    );
  });

  it("format watch", () => {
    equal(
      watchFormatter.format("unlink", "/home/abc/def"),
      "watch:unlink:/home/abc/def"
    );
  });

  it("unformat watch", () => {
    equal(
      watchFormatter.unformat("watch:unlink:/home/abc/def"),
      "unlink:/home/abc/def"
    );
  });

  it("format restart", () => {
    equal(restartFormatter.format("irb"), "restart:irb");
  });

  it("unformat restart", () => {
    equal(restartFormatter.unformat("restart:irb"), "irb");
  });

  it("format command", () => {
    equal(
      commandFormatter.format("lint", "stdout", "lint passing"),
      "command:lint:stdout:lint passing"
    );
  });

  it("unformat command", () => {
    equal(
      commandFormatter.unformat("command:lint:stdout:lint passing"),
      "lint passing"
    );
  });

  it("smart unformat", () => {
    equal(smartUnformat("shell:yarn lint:stdout:lint passing"), "lint passing");
    equal(smartUnformat("watch:unlink:/home/abc/def"), "unlink:/home/abc/def");
    equal(smartUnformat("restart:irb"), "irb");
    equal(smartUnformat("command:lint:stdout:lint passing"), "lint passing");
  });
});
