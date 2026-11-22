# Měření · jak počítat správně

Vzor v kódu: `../examples/cc-konverzace.mjs` (testy pokrývají každé pravidlo níže, které není
označené „neověřeno“). Vždy **parsuj JSON** po řádcích — pořadí polí se liší podle brány a modelu,
hledání textem minou.

## Claude Code

**Konverzace** = soubor `projects/<projekt>/<session>.jsonl` mimo složku `subagents/`, změněný
v okně (výchozí 30 dní podle mtime). Nepočítej `subagents/*.jsonl` jako konverzace.

**`/compact` (ověřeno 2026-11-21 na 314 konverzacích):**
- **Nezakládá nový soubor** — konverzace pokračuje ve stejném `.jsonl`, počet konverzací se nemění.
- Značka: řádek `type: "system"`, `subtype: "compact_boundary"`, s
  `compactMetadata.{trigger: "manual"|"auto", preTokens, postTokens, durationMs}`.
  `manual` = člověk zmáčkl `/compact`, `auto` = přeteklo samo.
- Hned po ní zpráva `isCompactSummary: true` = **shrnutí napsané AI**.
  - Nepočítej ji jako zprávu člověka a necituj ji jako „řekl jsem“.
  - Smíš ji použít pro **téma** konverzace (téma 6) — levnější než číst celý log.
- `preTokens` je **velikost kontextu**, ne spotřeba. Nepřičítej ho k tokenům.
- Metriky: konverzací s compact, celkem, manual vs. auto, průměrné `preTokens`.

**Zpráva člověka:** `type: "user"`, `message.role: "user"`, **ne** `isMeta`, **ne**
`isCompactSummary`, **ne** `isSidechain`, a obsah je text (řetězec nebo část `type: "text"`).
Část `type: "tool_result"` je výsledek nástroje, ne člověk. **Obaly harnessu** zapsané jako
`user` s textem začínajícím `<task-notification>`, `<local-command-stdout>`, `<local-command-stderr>`,
`<local-command-caveat>`, `<bash-stdout>`, `<bash-stderr>`, `<system-reminder>` nenapsal člověk —
nepočítej je (ověřeno 2026-11-21: 425 z 1 806 textových „zpráv“, tj. 23 %). `<command-name>`
(lomítkový příkaz) a `<bash-input>` (`!` příkaz) jsou akce člověka — počítej.
Zpráva bez `timestamp` se počítá, ale nejde do heatmapy ani aktivních dnů.
Řádek, který není JSON objekt, přeskoč.

**Odpovědi a volání se zapisují víckrát:** jedna odpověď modelu má víc řádků se stejným
`message.id` (každá část obsahu zvlášť, `usage` se dopisuje). Počítej podle `message.id`
(poslední zápis má konečné `usage`) a volání nástrojů podle `tool_use.id`.

**Tokeny** = `input_tokens + output_tokens` z `usage`, jednou na `message.id`; cache nepřičítej.
Vzor sčítá i přepisy pomocníků (práce AI celkem). Orientační číslo.

**Pomocníci (orchestrace):** počet = unikátní `tool_use.id` volání `Agent` nebo `Task`
v hlavních konverzacích; typ z `input.subagent_type` (chybí → `general-purpose`).
**Souběh** = kolik volání `Agent`/`Task` má **stejné `message.id`** — přes víc řádků
(po řádcích vychází vždy 1, ověřeno).

**Skilly a MCP podle použití:** volání `Skill` (`input.skill`), volání `mcp__<server>__<nástroj>`.
Ze vstupu nástroje ber jen tyhle názvy, nic jiného.

**Automatika:** pole `entrypoint` na řádcích. Viděné hodnoty (2026-11-21): `cli` (ruční práce
v terminálu) a `sdk-cli` — pravděpodobně spuštění programem (`claude -p`, automatika); význam
neověřen, potvrď s člověkem („24 konverzací spustil program — je to tvoje automatika?“).
Další hodnoty neověřeny. Desítky konverzací ve stejnou
hodinu každý den nebo víc než ~20 denně = pravděpodobně automatika → odděl od ručních, jinak
heatmapa a „ranní ptáče“ ukazují ingest, ne člověka.

**Čas:** heatmapa a aktivní dny z `timestamp` zpráv člověka v lokálním čase. **Dvě heatmapy:**
`heat` = konverzace s `entrypoint` `cli` nebo bez něj (člověk), `heat_automatika` = ostatní
(`sdk-cli`…). Aktivní dny jen z člověka.

**Poslední týden** = 7 dní před koncem **nejnovější konverzace v datech** (ne před dneškem —
deterministické a funguje i se starší kopií logů). Z něj: `pomocnici.posledni` (kdy · typ · popis)
a kandidáti `poslední týden` (pro téma 17).

**Popisy úkolů pomocníků:** jediný text, který vzor bere ze vstupu nástroje — pole `description`
volání `Agent`/`Task` (3–5 slov), max 80 znaků, absolutní cesty nahrazené `…`. Zadání (`prompt`)
nikdy.

**Projekty:** složka pod `projects/` = projekt (název složky je zakódovaná cesta, např.
`-Users-jan-kampane` — na slide nikdy, jen zobecněný název). Vzor dává konverzací, zpráv
člověka a datum poslední konverzace; „o čem“ doplň ze shrnutí po compact a prvních zpráv.

**Kód ve skillech** (`cc-nastaveni.mjs`): soubory podle přípony ve složce skillu (bez `*.md`,
`node_modules`, `.git`, `.venv`). Skill s kódem „dělá práci“ (skripty), bez kódu je jen návod.
Složka, která není skill (třeba synchronizovaná kopie bez `SKILL.md`), na slide nepatří.

**Křížová kontrola (vždy):**
`find <profil>/projects -name '*.jsonl' -not -path '*/subagents/*' -mtime -30 | wc -l`
musí sedět s počtem konverzací (± pár kusů). Velký rozdíl → věř `find` a řekni to.
Čísla, která nedávají smysl (aktivní dny > okno, souběh > celkem), neukazuj.

## Dvoufázové čtení obsahu

1. **Souhrn** (vzor): jen agregace a **kandidáti** — id souborů s důvodem (`nejdelší`,
   `nejvíc compact`, `nejvíc pomocníků`, `typická`).
2. **Výseky:** obsah čti jen u kandidátů a jen tolik, kolik téma potřebuje (ukázka konverzace,
   nejlepší/nejhorší moment). Témata projektů skládej ze shrnutí po compact, první zprávy člověka
   v konverzaci a názvu složky projektu — ne z celých logů.
3. `CLAUDE.md`, memories a strukturu druhého mozku čti celé (jsou malé), ale do prezentace jde
   jen shrnutí a max. 2–3 krátké citace (viz `redakce.md`).

## Codex, Hermes, ostatní

- **Codex:** konverzace = `sessions/**/*.jsonl`; komprimace = řádek `type: "compacted"`
  (ověřeno). Zpráva člověka, modely a tokeny — neověřeno; ověř na klíčích jednoho souboru,
  vzor `cc-konverzace.mjs` použij jako analogii (dedup, nečíst text).
- **Hermes:** SQLite (`~/.hermes/state.db`) — nečti. Počet přes `hermes sessions list`
  (výstup neověřen), jinak se zeptej.
- **Ostatní:** bez logů → jen nastavení a otázky.
