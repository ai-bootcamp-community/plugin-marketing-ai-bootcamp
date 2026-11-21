# Vzorové skripty

Vzory se **nespouští naslepo**: přečti je, zkopíruj do `~/ai-bootcamp-mastermind/work/`, přizpůsob
setupu člověka a spusť svou kopii. Ukazují, kam se vydat a jak správně parsovat; pravidla, ze kterých
vycházejí, jsou v `../reference/mereni.md`. Oba vypisují jen názvy a počty, nikdy text.
Potřebují Node 18+ a jen vestavěné moduly. Bez Node postupuj podle `mereni.md` ručně.

| Vzor | Co ukazuje | Co typicky upravíš |
| --- | --- | --- |
| `cc-konverzace.mjs <profil> [dní]` | konverzace Claude Code: zprávy člověka, `/compact`, pomocníci a jejich souběh, modely, tokeny, skilly a MCP podle volání, heatmapa, týdny, první výskyt, **kandidáti na čtení** | cestu k profilu, okno, sloučení víc profilů, metriku k tématu, které vzor nepokrývá |
| `cc-nastaveni.mjs <profil>` | nastavení Claude Code: skilly s popisem, pluginy, MCP (jen názvy), hooky (událost a počet), agenti, permissions (počty), CLAUDE.md a memory (jen počty) | projektové `CLAUDE.md`/`AGENTS.md`, Codex (`config.toml`), druhý profil |

## Na co pozor

- **Kandidáti z `cc-konverzace.mjs`** jsou id souborů (`<session>.jsonl` ve `projects/<projekt>/`).
  Až s nimi čti obsah, a jen výseky, které potřebuješ k tématu (4, 6, 17).
- **Konektory claude.ai** (Gmail, Drive, Kalendář…) v `.claude.json` nejsou. Uvidíš je jen jako
  volání `mcp__claude_ai_<název>__*` v logu, tedy v `mcp` výstupu `cc-konverzace.mjs`.
- **„Vlastní“ skill** je heuristika: složka, která není symlink. Převzaté balíčky bývají odkaz
  nebo přijdou z pluginu (`pluginy`). Na pochybnost se zeptej.
- **Codex, Hermes:** vzory nejsou. Postupuj podle `../reference/setupy.md` a použij vzor pro
  Claude Code jako analogii (Codex: `sessions/**/*.jsonl`, jiný tvar záznamu).
