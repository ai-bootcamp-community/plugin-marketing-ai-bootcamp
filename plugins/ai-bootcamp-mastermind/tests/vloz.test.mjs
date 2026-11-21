import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { vlozData } from "../skills/ai-bootcamp-mastermind/scripts/vloz.mjs";
import { nactiData } from "../skills/ai-bootcamp-mastermind/scripts/kontrola.mjs";

const SABLONA = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "skills",
  "ai-bootcamp-mastermind", "templates", "prezentace.html"), "utf8");
const data = { version: 1, meta: { name: "Test" }, sections: [{ id: "x", blocks: [{ type: "code", text: "</script><script>alert(1)</script> & <b>" }] }] };

test("vložená data se načtou zpět beze změny", () => assert.deepEqual(nactiData(vlozData(SABLONA, data), "a.html"), data));
test("text </script> v datech neukončí datový blok", () => {
  const html = vlozData(SABLONA, data);
  const blok = /<script type="application\/json" id="data">([\s\S]*?)<\/script>/.exec(html)[1];
  assert.doesNotMatch(blok, /</);
});
test("zbytek šablony zůstane", () => {
  const html = vlozData(SABLONA, data);
  assert.ok(html.includes('<script id="rozdeleni">'));
  assert.ok(!html.includes("Jana Kovářová"));
});
test("CLI zapíše výstup s právy 600", async () => {
  const { execFileSync } = await import("node:child_process");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mm-"));
  fs.writeFileSync(path.join(dir, "data.json"), JSON.stringify(data));
  const skript = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "skills", "ai-bootcamp-mastermind", "scripts", "vloz.mjs");
  execFileSync(process.execPath, [skript, path.join(dir, "data.json"), path.join(dir, "prezentace.html")]);
  assert.equal(fs.statSync(path.join(dir, "prezentace.html")).mode & 0o777, 0o600);
  assert.equal(nactiData(fs.readFileSync(path.join(dir, "prezentace.html"), "utf8"), "a.html").meta.name, "Test");
});
