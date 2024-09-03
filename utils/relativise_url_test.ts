import { assertEquals } from "@std/assert";
import { relativiseUrl } from "./relativise_url.ts";

Deno.test("relativise URL", () => {
  assertEquals(relativiseUrl("file:///a/b/c/d", "file:///a/b/"), "./c/d");
  assertEquals(relativiseUrl("file:///a/b/c/d", "file:///a/b"), "./b/c/d");
});
