import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyForm,
  profileToForm,
  buildProfilePayload,
  profileCompleteness,
} from "../src/lib/profile.js";

test("emptyForm has all string leaves", () => {
  const f = emptyForm();
  assert.equal(f.dob, "");
  assert.equal(f.tenth.percentage, "");
  assert.equal(f.budget.max, "");
});

test("profileToForm handles null and maps values", () => {
  assert.deepEqual(profileToForm(null), emptyForm());
  const f = profileToForm({
    dob: "2005-04-10T00:00:00.000Z",
    gender: "male",
    city: "Delhi",
    academicDetails: { tenth: { percentage: 90, board: "CBSE" } },
    budget: { max: 1000000 },
  });
  assert.equal(f.dob, "2005-04-10");
  assert.equal(f.city, "Delhi");
  assert.equal(f.tenth.percentage, "90");
  assert.equal(f.tenth.board, "CBSE");
  assert.equal(f.budget.max, "1000000");
  assert.equal(f.twelfth.board, "");
});

test("buildProfilePayload drops empties and casts numbers", () => {
  const form = emptyForm();
  form.city = "Delhi";
  form.tenth.percentage = "90.5";
  form.tenth.passingYear = "2021";
  form.budget.max = "1500000";
  assert.deepEqual(buildProfilePayload(form), {
    city: "Delhi",
    academicDetails: { tenth: { percentage: 90.5, passingYear: 2021 } },
    budget: { max: 1500000 },
  });
});

test("buildProfilePayload returns empty object for empty form", () => {
  assert.deepEqual(buildProfilePayload(emptyForm()), {});
});

test("profileCompleteness", () => {
  assert.equal(profileCompleteness(null), 0);
  const full = {
    dob: "2005-04-10T00:00:00.000Z",
    gender: "male",
    city: "a",
    state: "b",
    country: "c",
    academicDetails: { tenth: { percentage: 90 }, twelfth: { percentage: 80 } },
    budget: { max: 1 },
  };
  assert.equal(profileCompleteness(full), 100);
  assert.equal(profileCompleteness({ city: "a", state: "b" }), 25);
});
