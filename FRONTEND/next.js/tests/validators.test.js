import test from "node:test";
import assert from "node:assert/strict";
import { isEmail, minLength, isPercentage } from "../src/lib/validators.js";

test("isEmail accepts valid and rejects invalid", () => {
  assert.equal(isEmail("a@b.co"), true);
  assert.equal(isEmail(" a@b.co "), true);
  assert.equal(isEmail("a@b"), false);
  assert.equal(isEmail(""), false);
  assert.equal(isEmail(undefined), false);
});

test("minLength checks string length", () => {
  assert.equal(minLength("12345678", 8), true);
  assert.equal(minLength("1234567", 8), false);
  assert.equal(minLength(null, 8), false);
});

test("isPercentage allows empty and 0-100 only", () => {
  assert.equal(isPercentage(""), true);
  assert.equal(isPercentage(null), true);
  assert.equal(isPercentage("0"), true);
  assert.equal(isPercentage("100"), true);
  assert.equal(isPercentage("100.5"), false);
  assert.equal(isPercentage("-1"), false);
  assert.equal(isPercentage("abc"), false);
});
