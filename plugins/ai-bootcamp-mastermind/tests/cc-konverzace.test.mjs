import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rozeberKonverzaci, souhrnProfilu } from "../skills/ai-bootcamp-mastermind/examples/cc-konverzace.mjs";

const PROFIL = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "profil");
const s = souhrnProfilu(PROFIL, 100000);

test("konverzace = soubory mimo subagents; compact nezakládá novou", () => assert.equal(s.konverzace.celkem, 2));
test("zprávy člověka bez meta, tool_result, shrnutí po compact a pomocníků", () => assert.equal(s.zpravy_cloveka, 3));
test("tokeny: poslední zápis odpovědi, s pomocníky, bez preTokens", () => assert.equal(s.tokeny, 120 + 10 + 10 + 2000));
test("compact se počítá z compact_boundary", () =>
  assert.deepEqual(s.compact, { konverzaci_s_compact: 1, celkem: 1, manual: 1, auto: 0, preTokens_prumer: 300000 }));
test("pomocníci: počet a souběh v jedné odpovědi", () => {
  assert.equal(s.pomocnici.celkem, 2);
  assert.equal(s.pomocnici.max_soubezne, 2);
  assert.deepEqual(s.pomocnici.typy, { Explore: 1, "general-purpose": 1 });
});
test("skilly a MCP podle volání", () => {
  assert.deepEqual(s.skilly, { brainstorming: 1 });
  assert.deepEqual(s.mcp, { gmail: 1 });
});
test("entrypoint odliší automatické běhy", () => assert.deepEqual(s.konverzace.podle_entrypointu, { cli: 1, "sdk-cli": 1 }));
test("heatmapa sčítá zprávy člověka", () => {
  assert.equal(s.heat.length, 7);
  const soucet = h => h.flat().reduce((a, b) => a + b, 0);
  assert.equal(soucet(s.heat) + soucet(s.heat_automatika), 3); // v2: člověk + automatika
});
test("modely včetně pomocníků", () => assert.deepEqual(Object.keys(s.modely).sort(), ["Haiku", "Opus", "Sonnet"]));
test("první výskyt skillu a MCP", () => {
  assert.equal(s.prvni_vyskyt.skilly.brainstorming, "2026-11-10");
  assert.equal(s.prvni_vyskyt.mcp.gmail, "2026-11-10");
});
test("kandidáti nesou jen id a čísla", () => {
  const k = s.kandidati.find(x => x.duvod === "nejdelší");
  assert.deepEqual(k, { soubor_id: "s1", duvod: "nejdelší", zprav_cloveka: 2, compact: 1 });
});
test("v2: heatmapa člověka a automatiky zvlášť", () => {
  assert.equal(s.heat.flat().reduce((a, b) => a + b, 0), 2);
  assert.equal(s.heat_automatika.flat().reduce((a, b) => a + b, 0), 1);
  assert.equal(s.aktivni_dny, 1);
});
test("v2: konverzace bez entrypoint je člověk", async () => {
  const fs = await import("node:fs"), os = await import("node:os");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mm-")), proj = path.join(dir, "projects", "p");
  fs.mkdirSync(proj, { recursive: true });
  fs.writeFileSync(path.join(proj, "x.jsonl"), '{"type":"user","message":{"role":"user","content":"a"},"timestamp":"2026-11-10T08:00:00Z"}\n');
  const s2 = souhrnProfilu(dir, 30);
  assert.equal(s2.heat.flat().reduce((a, b) => a + b, 0), 1);
  assert.equal(s2.heat_automatika.flat().reduce((a, b) => a + b, 0), 0);
});
test("v2: poslední úkoly pomocníků s popisem, cesty zamaskované", () => {
  assert.deepEqual(s.pomocnici.posledni, [
    { datum: "2026-11-10", typ: "Explore", popis: "Rešerše konkurence" },
    { datum: "2026-11-10", typ: "general-purpose", popis: "Uprav …" },
  ]);
});
test("v2: přehled projektů", () =>
  assert.deepEqual(s.projekty, [{ projekt_id: "-proj-a", konverzaci: 2, zprav_cloveka: 3, posledni: "2026-11-11" }]));
test("v2: kandidáti z posledního týdne", () =>
  assert.ok(s.kandidati.some(k => k.duvod === "poslední týden" && k.soubor_id === "s1")));
test("výstup neobsahuje text zpráv", () => assert.doesNotMatch(JSON.stringify(s), /TAJNY_TEXT/));
test("souběh pomocníků počítá volání ze stejné odpovědi zapsaná na víc řádků", () => {
  const r = id => JSON.stringify({ type: "assistant", message: { id: "m1", role: "assistant", model: "claude-opus-5-5",
    content: [{ type: "tool_use", id, name: "Agent", input: { subagent_type: "Explore" } }] } });
  assert.equal(rozeberKonverzaci([r("a"), r("b"), r("c")].join("\n")).maxSoubeznychPomocniku, 3);
});
test("řádek, který není objekt (null, číslo), se přeskočí", () => {
  const k = rozeberKonverzaci('null\n42\n{"type":"user","message":{"role":"user","content":"a"},"timestamp":"2026-11-10T08:00:00Z"}');
  assert.equal(k.zpravyCloveka.length, 1);
});
test("zpráva bez timestamp neshodí souhrn a nezapočte se do heatmapy", async () => {
  const fs = await import("node:fs"), os = await import("node:os");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mm-")), proj = path.join(dir, "projects", "p");
  fs.mkdirSync(proj, { recursive: true });
  fs.writeFileSync(path.join(proj, "x.jsonl"), '{"type":"user","message":{"role":"user","content":"a"}}\n');
  const s2 = souhrnProfilu(dir, 30);
  assert.equal(s2.zpravy_cloveka, 1);
  assert.equal(s2.heat.flat().reduce((a, b) => a + b, 0), 0);
});
test("obaly systému a výstupy příkazů nejsou zprávy člověka", () => {
  const u = c => JSON.stringify({ type: "user", message: { role: "user", content: c }, timestamp: "2026-11-10T08:00:00Z" });
  const k = rozeberKonverzaci([
    u("<task-notification>hotovo</task-notification>"), u("<local-command-stdout>x</local-command-stdout>"),
    u("<bash-stdout>x</bash-stdout><bash-stderr></bash-stderr>"), u("<bash-stderr>x</bash-stderr>"),
    u("<local-command-caveat>x</local-command-caveat>"), u("<system-reminder>x</system-reminder>"),
    u("<command-name>/compact</command-name>"), u("<bash-input>ls</bash-input>"), u("normální zpráva"),
  ].join("\n"));
  assert.equal(k.zpravyCloveka.length, 3); // příkaz, ! příkaz a normální zpráva jsou akce člověka
});
test("nevalidní řádek neshodí rozbor", () => {
  const k = rozeberKonverzaci('{"type":"user","message":{"role":"user","content":"a"},"timestamp":"2026-11-10T08:00:00Z"}\n{"type":"assis');
  assert.equal(k.zpravyCloveka.length, 1);
});
