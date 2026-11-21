# ai-bootcamp-mastermind

Skill, který z tvého AI setupu udělá **deep dive prezentaci** pro mastermind session na AI BOOTCAMP:
jak s AI opravdu pracuješ — skilly zevnitř, orchestrace pomocníků, napojení (MCP), druhý mozek,
pravidla v CLAUDE.md, co si AI pamatuje, o čem se s ní bavíš a jak se to vyvíjelo.
Výsledek je jeden HTML soubor, který otevřeš v prohlížeči a listuješ šipkami.

Stav: **draft**. Vyzkoušeno: vzory na macOS s Claude Code (konverzace, nastavení), Codex jen
formát logu. Celý tok se skillem zatím ne. Design: [`docs/superpowers/specs/2026-11-21-ai-bootcamp-mastermind-design.md`](../../docs/superpowers/specs/2026-11-21-ai-bootcamp-mastermind-design.md).
**Autor:** Martin Žatkovič.

## Instalace (vlož agentovi)

Vlož do svého agenta (Claude Code, Codex, Hermes, Cursor…):

```text
Nainstaluj mi skill ai-bootcamp-mastermind z repa
https://github.com/ai-bootcamp-community/plugin-playground.
Postupuj podle plugins/ai-bootcamp-mastermind/INSTALL.md v tom repu.
```

Agent si návod ([`INSTALL.md`](INSTALL.md)) stáhne, vybere složku skillů svého nástroje, ukáže,
co kam kopíruje, a řekne ti, co skill dělá.

**Bez agenta, jedním příkazem** (Claude Code všech profilů, Codex, Hermes a `~/.agents/skills`):

```sh
curl -fsSL https://raw.githubusercontent.com/ai-bootcamp-community/plugin-playground/main/plugins/ai-bootcamp-mastermind/install.sh | sh
```

## Použití

1. Ve svém agentovi spusť `/ai-bootcamp-mastermind`.
2. Agent projde setup (pár minut), ukáže přehled 19 témat a zeptá se, co vynechat.
3. **Redakce:** po sekcích uvidíš přesně, co půjde do prezentace, s návrhy, co smazat nebo
   zobecnit (jména, klienti, čísla…). Bez tvého schválení sekce dál nejde.
4. Prezentace se otevře v prohlížeči: `~/ai-bootcamp-mastermind/prezentace.html`.

Počítej s 15–30 minutami.

## Co skill čte a co zůstane u tebe

- Čte **lokálně**: nastavení AI nástrojů, `CLAUDE.md`, memories, strukturu druhého mozku a vybrané
  výseky konverzací za 30 dní. Celé logy nečte — nejdřív spočítá, pak čte jen kandidáty.
- Nikdy do prezentace: adresy serverů, tokeny a klíče, e-maily, telefony, cesty k souborům
  (kontroluje `scripts/kontrola.mjs`). Jména, klienty a čísla navrhne ke smazání, rozhodneš ty.
- **Nic se neodesílá.** Výsledek je soubor u tebe; šablona nenačítá nic z internetu.
  `~/ai-bootcamp-mastermind/data.json` zůstane kvůli pozdějším úpravám, pracovní `work/` se smaže.

## Známé limity (draft)

- Nejpřesnější s Claude Code. Codex: formát logu ověřen jen částečně. Hermes (SQLite), Cursor,
  Gemini: jen nastavení a otázky.
- Témata projektů skládá ze shrnutí a prvních zpráv, ne z celých konverzací.
- Vzory potřebují Node 18+; bez něj agent počítá ručně a pomaleji.
