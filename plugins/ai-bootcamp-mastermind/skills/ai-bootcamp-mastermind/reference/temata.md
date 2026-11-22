# Témata deep divu a formát dat

Každé téma = jedna sekce prezentace (`sections[]`, `id` přesně podle tabulky). Téma bez dat
vynech, nevymýšlej. Každá sekce má `lead`: **jednu lidskou větu „co to znamená v praxi“**
(navrhne agent, potvrdí člověk) — publikum jsou lidé, kteří s agenty pracují, ale pointa musí
být srozumitelná i bez technických znalostí.

Kde hledat: `setupy.md`. Jak počítat: `mereni.md`. Co smazat: `redakce.md`.

| # | `id` | Téma | Co agent hledá | Odkud (Claude Code) | Bloky | Ptát se? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `mapa` | Mapa setupu | **graf, jak setup funguje**: člověk → nástroj → skilly, pomocníci, napojení, druhý mozek, automatika (hooky, plánované běhy) | profily, nastavení, hooky | `mermaid`, `chips` | ne |
| 2 | `skilly` | Skilly do detailu | **víc skillů (8–12)**; které **mají kód** (Python/Node/shell, kolik souborů a řádků) = „dělají práci“; tabulka skill · kód · použití · co dělá; **rozbor nejpoužívanějšího skillu s kódem**: přečti jeho skripty a řekni, co který dělá | `nastaveni.skilly[].kod`, volání `Skill`, skripty skillu | `stat`, `table`, `code` | který rozebrat, když jsou dva podobné |
| 3 | `orchestrace` | Orchestrace | **schéma** kdo řídí koho (já → hlavní agent → typy pomocníků, vlastní agenti); **co pomocníci řešili poslední týden** (tabulka kdy · typ · úkol) | `pomocnici.typy`, `pomocnici.posledni`, `agents/` | `mermaid`, `table`, `stat` | ne |
| 4 | `konverzace` | Jak spolu mluvíme | **3 ukázky různých typů** (např. plánování, oprava chyby, rychlý dotaz), každá 2–5 zpráv, anonymizované, s `title` | kandidáti `typická`, `poslední týden`, `nejvíc pomocníků` | `conversation` ×3 | výběr výseků |
| 5 | `mcp` | Napojení | MCP a konektory s četností | `.claude.json`, volání `mcp__*` | `bars`, `chips` | ne |
| 6 | `projekty` | Na čem to jede | **detailní přehled**: tabulka projekt · konverzací · naposledy · o čem (1 věta); 5–10 řádků; názvy projektů zobecnit podle redakce | `projekty` ze vzoru + shrnutí po compact a první zprávy | `table` | potvrdit názvy |
| 7 | `brain` | Druhý mozek | **struktura jako strom** (2–3 úrovně, u složky počet souborů a k čemu je), typy záznamů, jak ho AI používá (čte/zapisuje kdy) | viz „Druhý mozek“ v `setupy.md`; `find <brain> -maxdepth 3 -type d` + počty | `tree`, `list` | když se nenajde |
| 8 | `claude-md` | Moje pravidla pro AI | **víc detailu**: tabulka část instrukcí → co říká (5–8 řádků) + 3–5 citací; globální i projektové instrukce | `CLAUDE.md`, `AGENTS.md` (nadpisy `##` = části) | `table`, `code` | ne |
| 9 | `memories` | Co si o mně pamatuje | **ukázky záznamů** (4–6, zredigované) + **srovnání, kde všude si AI pamatuje**: paměť nástroje, druhý mozek, instrukce, jiné nástroje (ChatGPT paměť, Codex) — tabulka místo · co tam je · kolik | `projects/*/memory/` (`memory[].soubory`), brain, CLAUDE.md, otázka na ChatGPT | `list`, `table` | jestli používá paměť jinde |
| 10 | `ai-vs-prace` | Co řeším s AI a co v práci | rozdělení témat (příprava, psaní, učení, osobní…) | témata z 6 podle profilu | `bars`, `text` | jak to vidí on |
| 11 | `vyvoj` | Jak se to vyvíjelo | kdy přibyly nástroje, skilly, MCP; objem po týdnech | `prvni_vyskyt`, `tydny`, časy souborů | `timeline` | doplnit starší historii |
| 12 | `den` | Den s AI | **dvě heatmapy**: `title: "Já"` (`heat`) a `title: "Automatika"` (`heat_automatika`); bez automatiky jen první | `heat`, `heat_automatika` | `heatmap` ×2 | potvrdit, že jde o automatiku |
| 13 | `sama-vs-ja` | AI sama vs. se mnou | podíl automatiky a pomocníků; co automatika dělá krok po kroku | `entrypoint`, hooky, pomocníci | `stat`, `flow` | potvrdit automatiku |
| 14 | `mantinely` | Mantinely | **ukázky konkrétních pravidel**: co je povolené bez ptaní a co zakázané (2 seznamy s `title`, 3–6 položek, přeložené do lidské řeči) + výňatek pravidel, jak vypadají v nastavení; pojistky z hooků | `permissions.ukazky`, `hooks` | `list` ×2, `code` | ne |
| 15 | `modely` | Modely na co | který model kdy | `modely` | `bars` | na co který |
| 16 | `kontext` | Dlouhé konverzace | kolik přeteklo, ruční vs. auto `/compact`, velikost kontextu | `compact` | `stat`, `text` | ne |
| 17 | `momenty` | Nejlepší, nejhorší a poslední týden | nejlepší a nejhorší moment (`text` s `title`) + **5 momentů z posledního týdne** (tabulka kdy · co, jedna věta) | kandidáti `nejdelší`, `nejvíc compact`, `poslední týden` | `text` ×2, `table` | **vždy** vybere člověk |
| 18 | `sdileni` | Co sdílím s ostatními | vlastní skilly/pluginy v repech, týmový setup | git u složek skillů | `chips`, `list` | ne |
| 19 | `plany` | Co chci postavit dál | rozdělané věci | `plans/`, otevřené větve | `list` | **vždy** potvrdí člověk |

Příklad dobré `lead` věty: „Velký úkol rozdělím mezi pomocníky; já řídím, oni dělají rešerši
souběžně.“ Špatně: „Používám subagenty typu Explore s paralelním dispatchem.“

## Formát dat (`data.json` = datový blok šablony)

```json
{
  "version": 1,
  "meta": { "name": "", "role": "", "tools": [""], "sentence": "", "accent": "#e8875b", "theme": "tmava" },
  "sections": [ { "id": "skilly", "title": "", "lead": "", "blocks": [ { "type": "text", "text": "" } ] } ],
  "closing": { "ask": [""], "takeaways": [""] }
}
```

- `meta.theme`: `tmava` | `svetla`; `meta.accent`: `#rrggbb`.
- `closing.ask` = „S čím chci poradit“ (z tématu 19), `closing.takeaways` = „Co si odnést“.

| Blok | Pole |
| --- | --- |
| `text` | `text` |
| `list` | `items: string[]` |
| `chips` | `items: string[]` |
| `stat` | `value` (text nebo číslo), `label` |
| `bars` | `items: [popisek, číslo][]` |
| `heatmap` | `data: number[7][24]` (řádky po–ne, sloupce 0–23 h) |
| `flow` | `steps: string[]` |
| `conversation` | `messages: { who: "ja" \| "ai", text }[]` |
| `code` | `text`, `label` (volitelně) |
| `timeline` | `items: { when, what }[]` |
| `mermaid` | `text` — podmnožina mermaid: `flowchart LR` / `graph TD`, uzly `A[text]` `A(text)` `A{text}`, šipky `-->` `-.->` `==>` `---`, popisek `-->\|text\|`; řádky `style`/`classDef`/`%%` se ignorují. Co šablona nezná (`sequenceDiagram`, `subgraph`, `A[(db)]`, `<-->`), ukáže jako kód — drž se podmnožiny |
| `table` | `columns: string[]`, `rows: string[][]` (buňky jako text) |
| `tree` | `items: { name, note?, children? }[]` (vnořené) |

Každý blok může mít `title` (malý nadpis nad blokem, např. „Já“ / „Automatika“, „Povoleno“ / „Zakázáno“).
Prázdný blok i sekce bez bloků se nezobrazí. Slide unese 3 malé bloky, nebo 1 velký (`mermaid`,
`table`, `tree`) + 1 malý; zbytek jde na další slide.

Příklad mapy (mermaid):

```
flowchart LR
  J(Já) -->|zadání| CC[Claude Code]
  CC --> SK[Skilly]
  CC -->|souběžně| P{Pomocníci}
  CC --> N[Napojení: Gmail, Drive]
  CC -.-> B[Druhý mozek]
  A[Ranní automatika] -.-> CC
```
Ukázka všech typů: datový blok v `../templates/prezentace.html` (fiktivní persona).
