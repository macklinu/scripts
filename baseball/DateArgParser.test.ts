import { assertEquals, stub, test } from "../dev_deps.ts";
import { DateTime } from "../deps.ts";
import { DateArgParser } from "./DateArgParser.ts";

test({
  name: "validates relative date strings",
  fn: () => {
    assertEquals(DateArgParser.isValid("yesterday"), true);
    assertEquals(DateArgParser.isValid("today"), true);
    assertEquals(DateArgParser.isValid("tomorrow"), true);
  },
});

test({
  name: "empty date string is invalid",
  fn: () => {
    assertEquals(DateArgParser.isValid(""), false);
  },
});

test({
  name: "YYYY-MM-DD date string is valid",
  fn: () => {
    assertEquals(DateArgParser.isValid("2021-04-05"), true);
  },
});

test({
  name: "non YYYY-MM-DD date string is invalid",
  fn: () => {
    assertEquals(DateArgParser.isValid("04/05/2021"), false);
  },
});

test({
  name: "yesterday results in yesterday's date string",
  fn: () => {
    withStubbedCurrentDate(DateTime.fromISO("2021-04-05"), () => {
      assertEquals(DateArgParser.formatDate("yesterday"), "2021-04-04");
    });
  },
});

test({
  name: "today results in today's date string",
  fn: () => {
    withStubbedCurrentDate(DateTime.fromISO("2021-04-05"), () => {
      assertEquals(DateArgParser.formatDate("today"), "2021-04-05");
    });
  },
});

test({
  name: "tomorrow results in tomorrow's date string",
  fn: () => {
    withStubbedCurrentDate(DateTime.fromISO("2021-04-05"), () => {
      assertEquals(DateArgParser.formatDate("tomorrow"), "2021-04-06");
    });
  },
});

test({
  name: "valid date string results in ISO date string",
  fn: () => {
    assertEquals(DateArgParser.formatDate("2021-03-22"), "2021-03-22");
  },
});

function withStubbedCurrentDate(dateTime: DateTime, testFn: () => void) {
  const dateStub = stub(DateTime, "now", [dateTime]);
  try {
    testFn();
  } finally {
    dateStub.restore();
  }
}
