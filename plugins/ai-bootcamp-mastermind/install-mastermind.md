# Instalace skillu ai-bootcamp-mastermind · návod pro agenta

Tohle čte AI agent, kterého účastník požádal o instalaci (Claude Code, Codex, Hermes, Cursor…).
Komunikuj česky. Instalace jen kopíruje soubory: nic nespouštěj, nic neposílej.

**Zdroj:** repo https://github.com/ai-bootcamp-community/plugin-marketing-ai-bootcamp, větev `main`,
složka `plugins/ai-bootcamp-mastermind/skills/ai-bootcamp-mastermind/`. Skill tvoří tyhle soubory:

```
SKILL.md
reference/temata.md
reference/setupy.md
reference/mereni.md
reference/redakce.md
examples/README.md
examples/cc-konverzace.mjs
examples/cc-nastaveni.mjs
scripts/kontrola.mjs
scripts/vloz.mjs
templates/prezentace.html
```

Raw adresa: `https://raw.githubusercontent.com/ai-bootcamp-community/plugin-marketing-ai-bootcamp/main/plugins/ai-bootcamp-mastermind/skills/ai-bootcamp-mastermind/<soubor>`

## Postup

1. **Kam.** Zjisti, ve kterém nástroji běžíš, a vyber **jednu** cílovou složku:

   | Nástroj | Cílová složka |
   | --- | --- |
   | Claude Code | `$CLAUDE_CONFIG_DIR/skills/`, když je proměnná nastavená; jinak `~/.claude/skills/` |
   | Codex | `$CODEX_HOME/skills/`, když je proměnná nastavená; jinak `~/.codex/skills/` |
   | Hermes | `~/.hermes/skills/` |
   | Jiný nástroj | jeho složka uživatelských skillů podle jeho dokumentace; nevíš-li, `~/.agents/skills/` a ověř, že ji nástroj čte |

   Do dalších profilů a nástrojů instaluj jen na výslovné přání účastníka.

2. **Ukaž plán.** Napiš cílovou cestu `<složka>/ai-bootcamp-mastermind/` a seznam souborů.
   Existuje-li tam už starší verze, řekni, že ji přepíšeš.

3. **Stáhni a ulož.** Jedenáct souborů z raw adresy (`curl -fsSL … -o …` nebo vlastním nástrojem
   na stahování), nebo `git clone --depth 1` repa a zkopíruj celou složku skillu.
   Zachovej podsložky `reference/`, `examples/`, `scripts/`, `templates/`.

4. **Přečti a shrň.** Přečti `SKILL.md`, oba vzory v `examples/` a `scripts/kontrola.mjs`
   a dvěma třemi větami řekni, co skill dělá. Očekávané chování:
   - Skill dělá **osobní deep dive**: agent při běhu lokálně čte nastavení AI nástrojů,
     `CLAUDE.md`, memories, strukturu druhého mozku a **vybrané výseky konverzací**. To je
     záměr, ne chyba — bez toho deep dive nejde.
   - Vzory v `examples/` čtou logy konverzací a nastavení, ale vypisují jen názvy a počty,
     id souborů kandidátů na čtení a pár krátkých popisků (úkoly pomocníků, ukázky pravidel
     povolení, popisy skillů) se zamaskovanými cestami. Text zpráv, zadání pomocníků, hodnoty
     `env` ani adresy serverů nevypisují.
   - Před vytvořením prezentace člověk **po sekcích schvaluje**, co v ní bude (redakce).
   - Výsledek je HTML soubor v `~/ai-bootcamp-mastermind/`. Nic se nikam neposílá; šablona
     nenačítá nic z internetu. `vloz.mjs` jen vloží data do šablony, `kontrola.mjs` jen hledá
     úniky v hotovém souboru.
   - `cc-nastaveni.mjs` otevírá `.claude.json` (kde bývá i účet), ale vypisuje z něj jen
     názvy MCP serverů — to je v pořádku.

   Instalaci zastav a řekni proč, jen kdyby něco posílalo data po síti, četlo hesla a klíče
   (`auth.json`, `.env`, hodnoty `env`), nebo šablona načítala něco z internetu.

5. **Ověř Node.** `node --version`: vzory a kontrola potřebují Node 18+. Bez něj skill funguje
   taky, jen agent počítá ručně a pomaleji.

6. **Řekni, co dál.**
   - Nový skill se může načíst až v nové session (Hermes: `/reload-skills`).
   - Spustit: `/ai-bootcamp-mastermind`. Nenabízí-li nástroj lomítkové příkazy, stačí napsat
     „udělej mi deep dive na AI BOOTCAMP mastermind“.
   - Počítat s 15–30 minutami: sběr, pak společná redakce po sekcích.
