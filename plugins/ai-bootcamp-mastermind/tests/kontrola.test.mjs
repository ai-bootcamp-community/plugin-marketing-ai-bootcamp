import { test } from "node:test";
import assert from "node:assert/strict";
import { najdiUniky, nactiData, zkontroluj } from "../skills/ai-bootcamp-mastermind/scripts/kontrola.mjs";

const duvody = t => najdiUniky(t).map(n => n.duvod).join(" | ");

test("URL je únik", () => assert.match(duvody("viz https://x.cz"), /URL/));
test("doména bez protokolu je únik", () => assert.match(duvody("běží na intranet.firma.cz"), /URL/));
test("e-mail je únik", () => assert.match(duvody("piš na jan@firma.cz"), /e-mail/));
test("absolutní cesta uvnitř textu je únik", () => assert.match(duvody("leží v /Users/jan/brain"), /cesta/));
test("cesta z domovské složky je únik", () => assert.match(duvody("v ~/brain/x"), /cesta/));
test("windows cesta je únik", () => assert.match(duvody("C:\\Users\\x"), /cesta/));
test("tokeny jsou únik", () => {
  for (const t of ["klíč sk-abcdefghijklmnop", "ghp_abcdefghijklmnop", "glpat-abcdefghijklmnop"]) assert.match(duvody(t), /token/, t);
});
test("telefon je únik", () => assert.match(duvody("volej +420 777 123 456"), /telefon/));
test("relativní struktura není únik", () => assert.deepEqual(najdiUniky("struktura brain/projects/ a skills/"), []));
test("běžná čísla nejsou telefon", () => assert.deepEqual(najdiUniky("2 619 konverzací, 30 dní, 12 %"), []));

test("zkontroluj vrací cestu k řetězci", () => {
  const n = zkontroluj({ sections: [{ blocks: [{ type: "text", text: "a@b.cz" }] }] });
  assert.equal(n.length, 1);
  assert.equal(n[0].cesta, "sections[0].blocks[0].text");
});
test("zkontroluj prochází pole řetězců", () => {
  const n = zkontroluj({ closing: { ask: ["ok", "viz https://x.cz"] } });
  assert.equal(n[0].cesta, "closing.ask[1]");
});

test("nactiData z JSON", () => assert.deepEqual(nactiData('{"version":1}', "data.json"), { version: 1 }));
test("nactiData z HTML vytáhne datový blok", () => {
  const html = '<html><script type="application/json" id="data">{"version":1}</script><script>x()</script></html>';
  assert.deepEqual(nactiData(html, "prezentace.html"), { version: 1 });
});
test("nactiData z HTML bez bloku hodí chybu", () => assert.throws(() => nactiData("<html></html>", "a.html"), /datový blok/));
