# Instalace skillu ai-bootcamp-prezentace · návod pro agenta

Tohle čte AI agent, kterého účastník požádal o instalaci (Claude Code, Codex, Hermes, Cursor…).
Komunikuj česky. Instalace jen kopíruje soubory: nic nespouštěj, nic neposílej.

**Zdroj:** repo https://github.com/ai-bootcamp-community/plugin-marketing-ai-bootcamp, větev `main`,
složka `plugins/ai-bootcamp-prezentace/skills/ai-bootcamp-prezentace/`. Skill tvoří tyhle soubory:

```
SKILL.md
scripts/sber.mjs
scripts/over.mjs
reference/zdroje.md
```

Raw adresa: `https://raw.githubusercontent.com/ai-bootcamp-community/plugin-marketing-ai-bootcamp/main/plugins/ai-bootcamp-prezentace/skills/ai-bootcamp-prezentace/<soubor>`

## Postup

1. **Kam.** Zjisti, ve kterém nástroji běžíš, a vyber **jednu** cílovou složku:

   | Nástroj | Cílová složka |
   | --- | --- |
   | Claude Code | `$CLAUDE_CONFIG_DIR/skills/`, když je proměnná nastavená; jinak `~/.claude/skills/` |
   | Codex | `$CODEX_HOME/skills/`, když je proměnná nastavená; jinak `~/.codex/skills/` |
   | Hermes | `~/.hermes/skills/` |
   | Jiný nástroj | jeho složka uživatelských skillů podle jeho dokumentace; nevíš-li, `~/.agents/skills/` a ověř, že ji nástroj čte |

   Do dalších profilů a nástrojů instaluj jen na výslovné přání účastníka.

2. **Ukaž plán.** Napiš cílovou cestu `<složka>/ai-bootcamp-prezentace/` a seznam souborů.
   Existuje-li tam už starší verze, řekni, že ji přepíšeš.

3. **Stáhni a ulož.** Čtyři soubory z raw adresy (`curl -fsSL … -o …` nebo vlastním nástrojem
   na stahování), nebo `git clone --depth 1` repa a zkopíruj celou složku skillu.
   Zachovej strukturu podsložek `scripts/` a `reference/`.

4. **Přečti a shrň.** Přečti `SKILL.md` a oba skripty a dvěma třemi větami řekni, co dělají.
   Očekávané chování:
   - `sber.mjs` lokálně čte nastavení a logy konverzací AI nástrojů, ale bere z nich jen názvy
     (modely, nástroje, skilly, typy pomocníků) a počty. Text zpráv nevypisuje a na síť nesahá;
     výstup je JSON s názvy a počty.
   - `over.mjs` jen kontroluje hotový JSON slidu.
   - Ven jde jen slide, a to až po výslovném souhlasu (krok odeslání v `SKILL.md`).

   Instalaci zastav a řekni proč, jen kdyby skript posílal data po síti, vypisoval text
   konverzací, nebo četl hesla a klíče (`auth.json`, `.env`, hodnoty `env`).

5. **Ověř Node.** `node --version`: sběr potřebuje Node 18+. Bez něj skill funguje taky, jen se
   na víc věcí zeptá.

6. **Řekni, co dál.**
   - Nový skill se může načíst až v nové session (Hermes: `/reload-skills`).
   - V attendee app otevřít **Můj slide**, zkopírovat příkaz s osobním odkazem a vložit ho sem:
     `/ai-bootcamp-prezentace https://app.aibootcamp.cz/s/<token>`.
     Nenabízí-li nástroj lomítkové příkazy, stačí napsat „udělej mi slide pro AI BOOTCAMP“ a odkaz.
