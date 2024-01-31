import { assertEquals } from "https://deno.land/std@0.213.0/assert/mod.ts";
import { relativiseUrl } from "./relativise_url.ts";

Deno.test("relativise URL", () => {
  assertEquals(relativiseUrl("file:///a/b/c/d", "file:///a/b/"), "./c/d");
  assertEquals(relativiseUrl("file:///a/b/c/d", "file:///a/b"), "./b/c/d");
});
