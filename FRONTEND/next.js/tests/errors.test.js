import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage } from "../src/lib/errors.js";

test("429 gives rate limit message", () => {
  assert.equal(
    getErrorMessage({ response: { status: 429, data: { message: "x" } } }),
    "Too many attempts. Please try again later."
  );
});

test("backend message is used when present", () => {
  assert.equal(
    getErrorMessage({ response: { status: 401, data: { message: "Invalid email or password" } } }),
    "Invalid email or password"
  );
});

test("no response means network failure", () => {
  assert.equal(getErrorMessage(new Error("Network Error")), "Cannot reach server");
});

test("fallback message", () => {
  assert.equal(getErrorMessage({ response: { status: 500, data: {} } }), "Something went wrong");
});
