# Vzorové skripty

**Inspirace, ne hotový nástroj.** Vznikly na jednom setupu (macOS, Claude Code, Node 18+).
Na jiném počítači můžou cesty, profily nebo formát logu vypadat jinak — vzor pak buď upravíš,
nebo napíšeš vlastní podle stejných pravidel. Postup: rozhlédni se (jak vypadá setup a jeden
záznam logu), porovnej se vzorem, zkopíruj do `~/ai-bootcamp-mastermind/work/` a přizpůsob,
spusť svou kopii, ověř výsledek druhou cestou. Ukazují, kam se vydat a jak správně parsovat; pravidla, ze kterých
vycházejí, jsou v `../reference/mereni.md`. Vypisují názvy a počty; z textu jen krátké popisy
úkolů pomocníků (`description`, max 80 znaků), popisy skillů z hlavičky a ukázky pravidel
permissions — cesty zamaskované. Text zpráv a zadání pomocníků nikdy.
Potřebují Node 18+ a jen vestavěné moduly. Bez Node postupuj podle `mereni.md` ručně.

| Vzor | Co ukazuje | Co typicky upravíš |
| --- | --- | --- |
| `cc-konverzace.mjs <profil> [dní]` | konverzace Claude Code: zprávy člověka, `/compact`, pomocníci (souběh, **co řešili poslední týden**), modely, tokeny, skilly a MCP podle volání, **heatmapa člověk vs. automatika**, týdny, první výskyt, **přehled projektů**, **kandidáti na čtení** (vč. posledního týdne) | cestu k profilu, okno, sloučení víc profilů, metriku k tématu, které vzor nepokrývá |
| `cc-nastaveni.mjs <profil>` | nastavení Claude Code: skilly s popisem a **kódem** (Python/Node/shell, řádky), pluginy, MCP (jen názvy), hooky (událost a počet), agenti, permissions (počty + **ukázky pravidel**), CLAUDE.md (řádky), memory (počty a **jména souborů**) | projektové `CLAUDE.md`/`AGENTS.md`, Codex (`config.toml`), druhý profil |

## Na co pozor

- **Kandidáti z `cc-konverzace.mjs`** jsou id souborů (`<session>.jsonl` ve `projects/<projekt>/`).
  Až s nimi čti obsah, a jen výseky, které potřebuješ k tématu (4, 6, 17).
- **Konektory claude.ai** (Gmail, Drive, Kalendář…) v `.claude.json` nejsou. Uvidíš je jen jako
  volání `mcp__claude_ai_<název>__*` v logu, tedy v `mcp` výstupu `cc-konverzace.mjs`.
- **„Vlastní“ skill** je heuristika: složka, která není symlink. Převzaté balíčky bývají odkaz
  nebo přijdou z pluginu (`pluginy`). Na pochybnost se zeptej.
- **Codex, Hermes:** vzory nejsou. Postupuj podle `../reference/setupy.md` a použij vzor pro
  Claude Code jako analogii (Codex: `sessions/**/*.jsonl`, jiný tvar záznamu).
