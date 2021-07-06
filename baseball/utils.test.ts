import { startsWith } from "./utils.ts";
import { assertEquals, test } from "../dev_deps.ts";

test("startsWith() supports multiple options", () => {
  assertEquals(startsWith("Test", []), false);
  assertEquals(startsWith("Test", ["T"]), true);
  assertEquals(startsWith("Test", ["D", "T"]), true);
});
