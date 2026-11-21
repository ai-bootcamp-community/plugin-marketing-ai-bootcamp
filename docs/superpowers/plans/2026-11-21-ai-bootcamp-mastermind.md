# ai-bootcamp-mastermind Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skill, který projde AI setup účastníka, s ním interaktivně zrediguje nálezy a vyrobí lokální HTML deep dive prezentaci (mastermind).

**Architecture:** Cesta B: hodnota je v sepsaných referencích (kde co hledat, jak měřit, co redigovat) a v SKILL.md postupu. Vzorové skripty v `examples/` ukazují správné parsování; agent si podle nich napíše vlastní. Jediné „ostré“ skripty: kontrola úniků a šablona HTML, která vykreslí vložený JSON.

**Tech Stack:** Markdown, Node 18+ (jen vestavěné moduly, testy `node --test`), jeden soběstačný HTML soubor (vanilla JS/CSS).

**Spec:** `docs/superpowers/specs/2026-11-21-ai-bootcamp-mastermind-design.md`

## Global Constraints

- Vše česky (texty skillu, referencí, šablony, výpisy skriptů).
- Node 18+, jen vestavěné moduly; žádné npm závislosti.
- Šablona: jeden soubor, **žádné externí zdroje** (CDN, webfonty, obrázky z URL).
- Výstupy člověka jen v `~/ai-bootcamp-mastermind/` (`data.json`, `prezentace.html`, `work/`); soubory s daty práva 600.
- Vzorové skripty vypisují jen agregace a identifikátory (id souboru, počty, názvy) — **nikdy text zpráv ani vstupy nástrojů**.
- „Vždy ven“: URL/hosty, tokeny/klíče/hesla, e-maily, telefony, absolutní cesty a domovská složka, `auth.json`/`.env` obsah.
- Fakta o logu Claude Code (ověřeno 2026-11-21): `/compact` nezakládá nový soubor; řádek `type:"system"`, `subtype:"compact_boundary"`, `compactMetadata.{trigger:"manual"|"auto", preTokens, postTokens, durationMs}`; následuje zpráva `isCompactSummary:true` (shrnutí od AI); `preTokens` není spotřeba; dedup podle `message.id` a `tool_use.id`; parsovat JSON, ne regexem.

## Review Focus

1. Konverzace s `/compact` se počítá jako **jedna** a shrnutí po komprimaci se nepočítá jako zpráva člověka ani do tokenů → Task 2 testy.
2. Řádky, které nejsou platný JSON (rozepsaný log běžící session), skript tiše přeskočí a nespadne → Task 2 test.
3. Data v šabloně s HTML znaky (`<script>`, `&`) se vykreslí jako text, ne jako HTML (únik/rozbití stránky) → Task 4 test (žádné `innerHTML`). Navíc `</script>` uvnitř JSON by ukončilo datový blok → SKILL.md: při vkládání nahradit `<` za `<`; Task 4 test: demo data s `</script>` v textu po této náhradě projdou `nactiData`.
4. Kontrola úniků najde absolutní cestu i uvnitř delšího textu a `~/…`, ale nehlásí relativní strukturu `brain/projects/` → Task 1 testy.
5. Sekce bez dat / prázdný blok se v prezentaci nezobrazí jako prázdný slide → Task 4 test.

## File Structure

```
plugins/ai-bootcamp-mastermind/
  README.md, INSTALL.md, install.sh                 # Task 6
  skills/ai-bootcamp-mastermind/
    SKILL.md                                        # Task 6
    reference/{setupy,temata,mereni,redakce}.md     # Task 5
    examples/cc-konverzace.mjs                      # Task 2
    examples/cc-nastaveni.mjs, examples/README.md   # Task 3
    scripts/kontrola.mjs                            # Task 1
    templates/prezentace.html                       # Task 4
  tests/                                            # testy + fixtures (neinstalují se)
```

## Datový formát prezentace (sdílí Task 1, 4, 6)

`data.json` i blok `<script type="application/json" id="data">` v šabloně:

```json
{
  "version": 1,
  "meta": { "name": "", "role": "", "tools": [""], "sentence": "", "accent": "#e8875b", "theme": "tmava" },
  "sections": [ { "id": "skilly", "title": "", "lead": "", "blocks": [ { "type": "text", "text": "" } ] } ],
  "closing": { "ask": [""], "takeaways": [""] }
}
```

Typy bloků a jejich pole: `text{text}`, `list{items:string[]}`, `chips{items:string[]}`, `stat{value:string|number,label}`, `bars{items:[label,number][]}`, `heatmap{data:number[7][24]}` (po–ne × 0–23 h), `flow{steps:string[]}`, `conversation{messages:{who:"ja"|"ai",text}[]}`, `code{text,label?}`, `timeline{items:{when,what}[]}`.

---

### Task 1: Kontrola úniků (`scripts/kontrola.mjs`)

**Files:**
- Create: `plugins/ai-bootcamp-mastermind/skills/ai-bootcamp-mastermind/scripts/kontrola.mjs`
- Test: `plugins/ai-bootcamp-mastermind/tests/kontrola.test.mjs`

**Interfaces:**
- Produces: `export function najdiUniky(text: string): {duvod: string, ukazka: string}[]`; `export function nactiData(obsah: string, jmenoSouboru: string): object` (z `.json` parsuje přímo, z `.html` vytáhne blok `#data`); `export function zkontroluj(data: object): {cesta: string, duvod: string, ukazka: string}[]` (projde všechny řetězce, `cesta` jako `sections[2].blocks[0].text`). CLI: `node kontrola.mjs <soubor.json|.html>` → exit 0 a „OK — žádné úniky“, jinak exit 1 a řádek na nález `cesta: důvod: „ukázka…“`; exit 2 při chybějícím argumentu nebo neplatném JSON.

- [ ] **Step 1: Napiš testy** (`node:test`, `assert`):
  - `najdiUniky("viz https://x.cz")` → 1 nález, důvod obsahuje „URL“
  - `najdiUniky("piš na jan@firma.cz")` → důvod „e-mail“
  - `najdiUniky("leží v /Users/jan/brain")` i `"v ~/brain/x"` i `"C:\\Users\\x"` → důvod „cesta“
  - `najdiUniky("klíč sk-abcdefghijklmnop")`, `ghp_…`, `glpat-…` → důvod „token“
  - `najdiUniky("+420 777 123 456")` → důvod „telefon“
  - `najdiUniky("struktura brain/projects/ a skills/")` → `[]`
  - `zkontroluj({sections:[{blocks:[{type:"text",text:"a@b.cz"}]}]})[0].cesta === "sections[0].blocks[0].text"`
  - `nactiData` z HTML s `<script type="application/json" id="data">{"version":1}</script>` vrátí `{version:1}`
- [ ] **Step 2:** `node --test plugins/ai-bootcamp-mastermind/tests/` → FAIL (modul neexistuje)
- [ ] **Step 3: Implementuj.** Vzory URL/e-mail/token převezmi z `plugins/ai-bootcamp-prezentace/skills/ai-bootcamp-prezentace/scripts/over.mjs` (`LEAK`), uprav cestu tak, aby chytala i uprostřed textu (`/Users/`, `/home/`, `~/`, `X:\`), přidej telefon (`\+?\d[\d ]{8,}\d`). Vynech vzor „HTML“ a „řídicí znaky“ (šablona escapuje sama).
- [ ] **Step 4:** `node --test …` → PASS
- [ ] **Step 5: Commit** `feat(mastermind): kontrola úniků`

### Task 2: Vzor pro konverzace Claude Code (`examples/cc-konverzace.mjs`)

**Files:**
- Create: `…/skills/ai-bootcamp-mastermind/examples/cc-konverzace.mjs`
- Test: `plugins/ai-bootcamp-mastermind/tests/cc-konverzace.test.mjs`, fixtures `tests/fixtures/profil/projects/-proj-a/{s1,s2}.jsonl`, `…/s1/subagents/agent-x.jsonl`

**Interfaces:**
- Produces: `export function rozeberKonverzaci(text: string): Konverzace`, kde `Konverzace = {zpravyCloveka: string[] /*ISO časy*/, odpovedi: Map<id,{model,tokeny}>, nastroje: Map<id,{jmeno, skill?, subagent?, mcpServer?}>, maxSoubeznychPomocniku: number, compact: {trigger, preTokens}[], entrypoint: string|null, zacatek: string|null, konec: string|null}`; `export function souhrnProfilu(cestaProfilu: string, dni: number = 30): Souhrn` (JSON níže); CLI `node cc-konverzace.mjs <profil> [dni]` vypíše `Souhrn` na stdout.
- `Souhrn = {profil_nazev, okno_dni, konverzace:{celkem, podle_entrypointu:{[e]:n}}, zpravy_cloveka, aktivni_dny, heat:number[7][24], modely:{[label]:n}, tokeny, pomocnici:{celkem, typy:{[t]:n}, max_soubezne}, skilly:{[n]:pocet}, mcp:{[server]:pocet}, compact:{konverzaci_s_compact, celkem, manual, auto, preTokens_prumer}, tydny:{["YYYY-Www"]:konverzaci}, prvni_vyskyt:{skilly:{[n]:datum}, mcp:{[s]:datum}}, kandidati:{soubor_id, duvod, zprav_cloveka, compact}[]}`
  - `kandidati`: max 10, důvody `"nejdelší"`, `"nejvíc compact"`, `"nejvíc pomocníků"`, `"typická"` (medián délky); `soubor_id` = jméno souboru bez cesty.

- [ ] **Step 1: Fixtures.** `s1.jsonl`: 3 zprávy člověka (jedna s `isMeta:true`, jedna s `content` jen `tool_result` — nepočítají se), odpověď `msg_1` zapsaná 2× (různé `usage`, platí poslední), `tool_use` `Skill{skill:"brainstorming"}`, dva `Agent` v jedné odpovědi, `mcp__gmail__search`, `compact_boundary` s `trigger:"manual", preTokens:300000`, následná zpráva `isCompactSummary:true`, jeden nevalidní řádek. `s2.jsonl`: 1 zpráva člověka, `entrypoint:"sdk-cli"`. Subagent soubor: 1 odpověď.
- [ ] **Step 2: Testy:**
  - `souhrnProfilu(fixture, 100000).konverzace.celkem === 2` (subagent soubor se nepočítá, compact nezakládá novou)
  - `zpravy_cloveka === 3` (2 z s1 + 1 z s2; meta, tool_result a compact summary ne)
  - `tokeny` = součet input+output **posledního** zápisu `msg_1` + ostatních odpovědí; `preTokens` (300000) se nepřičítá
  - `compact` = `{konverzaci_s_compact:1, celkem:1, manual:1, auto:0, preTokens_prumer:300000}`
  - `pomocnici.celkem === 2`, `pomocnici.max_soubezne === 2`
  - `skilly.brainstorming === 1`, `mcp.gmail === 1`
  - `konverzace.podle_entrypointu["sdk-cli"] === 1`
  - nevalidní řádek nezpůsobí výjimku
  - `JSON.stringify(souhrn)` neobsahuje žádný text zpráv z fixtures (fixtures obsahují značku `TAJNY_TEXT`)
- [ ] **Step 3:** `node --test …` → FAIL
- [ ] **Step 4: Implementuj.** Okno podle mtime souboru (jako `sber.mjs`), časy pro heat a dny z `timestamp` zpráv člověka (lokální čas). Zpráva člověka: `type:"user"`, `message.role:"user"`, ne `isMeta`, ne `isCompactSummary`, ne `isSidechain`, obsah je řetězec nebo obsahuje část `type:"text"`. Model label převezmi z `sber.mjs` (`modelLabel`). Na začátek souboru komentář: k čemu vzor je, co agent typicky upraví (profil, okno, další nástroj), a odkaz na `reference/mereni.md`.
- [ ] **Step 5:** `node --test …` → PASS
- [ ] **Step 6: Commit** `feat(mastermind): vzor pro konverzace Claude Code`

### Task 3: Vzor pro nastavení (`examples/cc-nastaveni.mjs`) + `examples/README.md`

**Files:**
- Create: `…/examples/cc-nastaveni.mjs`, `…/examples/README.md`
- Test: `tests/cc-nastaveni.test.mjs`, fixtures `tests/fixtures/profil/{settings.json,.claude.json,CLAUDE.md,skills/muj-skill/SKILL.md,agents/x.md,projects/-proj-a/memory/MEMORY.md}`

**Interfaces:**
- Produces: `export function nastaveniProfilu(cesta: string): Nastaveni`; CLI `node cc-nastaveni.mjs <profil>`.
- `Nastaveni = {skilly:{nazev, popis, vlastni:boolean}[], pluginy:string[], mcp:{nazev, rozsah:"globalni"|"projekt"}[], hooky:{udalost, pocet}[], agenti:{nazev, popis}[], permissions:{allow:number, deny:number, ask:number, defaultMode:string|null}, claude_md:{soubor_id, radku}[], memory:{projekt_id, souboru}[], env_klice:string[]}`
  - `popis` = `description` z frontmatteru (max 200 znaků). `vlastni` = složka skillu není symlink a nemá `.git` nadřazeného balíčku pluginu (heuristika; popiš v README).
  - **Nikdy** hodnoty `env`, URL/command MCP serverů ani obsah CLAUDE.md.

- [ ] **Step 1: Testy:** fixture `.claude.json` má `mcpServers.gmail{url:"https://tajne.cz"}` → výstup obsahuje `gmail`, neobsahuje `tajne.cz`; `settings.json` `env:{X_TOKEN:"sk-…"}` → `env_klice` = `["X_TOKEN"]`, hodnota nikde; `hooks.SessionStart` se 2 hooky → `{udalost:"SessionStart", pocet:2}`; `permissions.deny` 3 položky → `deny:3`; skill popis načten; `claude_md[0].radku` odpovídá fixture.
- [ ] **Step 2:** FAIL → **Step 3:** implementuj → **Step 4:** PASS
- [ ] **Step 5: `examples/README.md`:** tabulka vzor → co ukazuje → co agent typicky upraví; věta „vzory se nespouští naslepo: přečti, přizpůsob, spusť svou kopii z `~/ai-bootcamp-mastermind/work/`“.
- [ ] **Step 6: Commit** `feat(mastermind): vzor pro nastavení`

### Task 4: Šablona `templates/prezentace.html` s fiktivní personou

**Files:**
- Create: `…/templates/prezentace.html`
- Test: `tests/sablona.test.mjs`

**Interfaces:**
- Consumes: Datový formát prezentace (výše); `nactiData`, `zkontroluj` z Task 1.
- Produces: šablona, ve které agent mění jen obsah `<script type="application/json" id="data">`. Vykreslovací funkce `export`ovat nelze (HTML), ale skript v šabloně definuje `window.vykresli(data)` a sám ji zavolá s daty z bloku.

- [ ] **Step 1: Testy:**
  - `nactiData(sablona)` projde a `version === 1`
  - demo data obsahují všech 10 typů bloků a sekce pro 19 témat (`id` dle tabulky v `reference/temata.md`: `mapa, skilly, orchestrace, konverzace, mcp, projekty, brain, claude-md, memories, ai-vs-prace, vyvoj, den, sama-vs-ja, mantinely, modely, kontext, momenty, sdileni, plany`)
  - `zkontroluj(demo)` → `[]` (fiktivní persona nemá úniky)
  - šablona neobsahuje `http://` ani `https://` mimo komentáře a `src=`/`href=` na externí zdroje
  - šablona neobsahuje `innerHTML`, `outerHTML`, `insertAdjacentHTML` ani `document.write` (data jen přes `textContent`)
  - čistá funkce `rozdelNaSlidy(data): {typ:"titul"|"sekce"|"zaver", sekce?, bloky?}[]` je v samostatném `<script id="rozdeleni">` (bez DOM); test vytáhne jeho text, spustí ve `node:vm` a ověří: sekce s `blocks: []` nevznikne, prázdný blok (`list` s `items: []`) se vynechá, sekce s 5 bloky dá 2 slidy (max 3 bloky na slide), první slide `titul`, poslední `zaver`
- [ ] **Step 2:** FAIL → **Step 3: Implementuj.** Slidy přes celou obrazovku; titul z `meta`, pak sekce (titulek, `lead` jako zvýrazněná věta, bloky), závěr z `closing`. Ovládání: šipky, mezerník, PageUp/Down, klik, `Home/End`; číslo slidu; hash `#5` pro odkaz. `@media print` = slide na stránku. Téma `tmava|svetla`, akcent z `meta.accent`. Veškerý text přes `textContent`. Sekce s víc bloky, než se vejde, se rozdělí na 2 slidy (max ~3 bloky na slide).
- [ ] **Step 4:** PASS; **Step 5:** `open` šablonu v prohlížeči a projdi všechny slidy (vizuální kontrola: nic nepřetéká, oba motivy).
- [ ] **Step 6: Commit** `feat(mastermind): HTML šablona s ukázkovou personou`

### Task 5: Reference (`setupy.md`, `temata.md`, `mereni.md`, `redakce.md`)

**Files:** Create `…/reference/setupy.md`, `temata.md`, `mereni.md`, `redakce.md`

- [ ] **Step 1: `setupy.md`** — rozšíření `plugins/ai-bootcamp-prezentace/skills/ai-bootcamp-prezentace/reference/zdroje.md` (tabulka nástrojů) o: CLAUDE.md/AGENTS.md, memory, permissions, plans, second brain (jak ho poznat: složky odkazované z CLAUDE.md, `brain/`, Obsidian vault). Codex ověř na `~/.codex*` (jen klíče a názvy); Hermes, Cursor, Gemini, Copilot, opencode označ „neověřeno“.
- [ ] **Step 2: `temata.md`** — 19 témat z designu: `id` (seznam z Task 4), co hledat, odkud, který blok šablony použít, co je „lidská věta“ (příklad), kdy se ptát člověka (17, 19).
- [ ] **Step 3: `mereni.md`** — fakta z Global Constraints + pravidla z Task 2 (co je zpráva člověka, dedup, okno, automatika, subagenti, křížová kontrola `find … | wc -l`), dvoufázové čtení (souhrn → kandidáti → číst jen výseky), Hermes SQLite jen přes `hermes sessions list`.
- [ ] **Step 4: `redakce.md`** — „vždy ven“ (odkaz na `scripts/kontrola.mjs`) + tabulka kategorií s příkladem a návrhem z designu + formát redakce jedné sekce (Co tam je / Navrhuju smazat / Volby).
- [ ] **Step 5: Ověř** shodu `mereni.md` s testy Task 2 (každé pravidlo má test nebo je označené „neověřeno“).
- [ ] **Step 6: Commit** `docs(mastermind): reference`

### Task 6: SKILL.md, README, INSTALL.md, install.sh

**Files:** Create `…/SKILL.md`, `plugins/ai-bootcamp-mastermind/{README.md,INSTALL.md,install.sh}`

- [ ] **Step 1: `SKILL.md`** — frontmatter `name: ai-bootcamp-mastermind`, `description: Use when the user runs /ai-bootcamp-mastermind or wants a deep-dive HTML presentation of how they work with AI for an AI BOOTCAMP mastermind session.` Postup = kroky 1–10 z designu, odkazy na reference/vzory/šablonu/kontrolu, cesty přes `<složka tohoto skillu>`. Sekce „Časté chyby“: shrnutí po compact jako citace člověka; přičítání `preTokens`; čtení všech logů celých; absolutní cesty ve struktuře brainu.
- [ ] **Step 2: `INSTALL.md`** — kopie `plugins/ai-bootcamp-prezentace/INSTALL.md` upravená: jiný seznam souborů (celá složka skillu kromě `tests/`), krok 4 popisuje očekávané chování vzorů a `kontrola.mjs` (čtou lokálně, vypisují agregace, nic neposílají).
- [ ] **Step 3: `install.sh`** — podle `ai-bootcamp-prezentace/install.sh`, seznam souborů z Task 1–5; `sh -n` projde; test: `HOME=$(mktemp -d) sh install.sh` s RAW na lokální `file://` není potřeba — stačí `sh -n` a ruční kontrola seznamu proti `find skills -type f`.
- [ ] **Step 4: `README.md`** — k čemu, instalační prompt (jako u prezentace, s cestou na tento `INSTALL.md`), co čte, co zůstane u tebe, kam ukládá, známé limity (Codex/Hermes neověřeno, dvoufázové čtení).
- [ ] **Step 5:** `node --test plugins/ai-bootcamp-mastermind/tests/` → PASS (celek)
- [ ] **Step 6: Commit** `feat(mastermind): SKILL.md a instalace`

### Task 7: Test na Martinových datech (end-to-end)

- [ ] **Step 1:** Nainstaluj skill lokálně (kopie složky skillu do `~/.claude-personal/skills/`), nová session, spusť `/ai-bootcamp-mastermind`.
- [ ] **Step 2:** Projdi celý tok s Martinem: setupy, sběr, křížová kontrola (počet konverzací proti `find`), přehled, redakce po sekcích, výroba, kontrola úniků, otevření.
- [ ] **Step 3:** Zapiš nálezy (co agent minul, kde hádal, kde trvalo dlouho) do `~/ClaudeCodePersonal/workspace/stack-slide/README.md` sekce „Mastermind test“; opravy jako další commity.
- [ ] **Step 4:** Ověř, že `~/ai-bootcamp-mastermind/work/` je po běhu smazaný a `prezentace.html` projde `kontrola.mjs`.
