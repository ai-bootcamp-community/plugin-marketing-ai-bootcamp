# Zdroje dat pro slide · co kde najít a jak to zjistit

Platí pro skript `scripts/sber.mjs` i pro vlastní průzkum agenta. Cesty se mezi verzemi nástrojů
mění: když něco nesedí, podívej se, co ve složce skutečně je, a neodhaduj.

## Co potřebuju zjistit

| Údaj | Pole slidu | Nejlepší zdroj |
| --- | --- | --- |
| Které AI nástroje člověk **opravdu používá** a který nejvíc | `tools` | počet konverzací za 30 dní podle nástroje |
| Model(y) | `models` | nastavení + modely v odpovědích (logy) |
| Skilly / pluginy (názvy, u vlastních i popis) | `skills`, `uses`, `ask` | složky skillů, `enabledPlugins`, hlavička `SKILL.md` |
| Napojení (MCP) | `mcp` | konfigurace MCP serverů — jen **názvy** |
| Automatizace (hooky, plánované běhy, vlastní agenti) | `setup`, `ask` | `hooks`, složka `agents/` |
| Aktivita 30 dní: konverzace, dny, série, hodiny | `stats` | časy souborů konverzací |
| Co AI udělala: úpravy, příkazy, web | `did` | volání nástrojů v logu |
| Pomocníci (subagenti): kolik, jaké typy, co udělali | `stats.helpers`, `setup` | volání `Agent`/`Task` + přepisy subagentů |
| Tokeny (jen se souhlasem) | `tokens` | `usage` v odpovědích, vstup + výstup, jednou na odpověď |
| Automatické vs. ruční konverzace | poznámka ke `stats` | počet konverzací za hodinu/den, typ spuštění |

## Kde to leží

| Nástroj | Kořen (přepis proměnnou) | Model | Skilly | MCP | Hooky / agenti | Konverzace |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | `~/.claude`, další profily `~/.claude-*` (`CLAUDE_CONFIG_DIR`) | `settings.json` → `model` | `skills/*/SKILL.md`, `settings.json` → `enabledPlugins` | `<profil>/.claude.json` → `mcpServers` a `projects.*.mcpServers` (výchozí profil: `~/.claude.json`) | `settings.json` → `hooks`; `agents/*.md` | `projects/**/*.jsonl`; subagenti v `…/subagents/*.jsonl` |
| Codex | `~/.codex`, `~/.codex-*` (`CODEX_HOME`) | `config.toml` → `model` | `skills/*/SKILL.md`, `[plugins."…"]` | `config.toml` → `[mcp_servers.<název>]` | `hooks.json` | `sessions/**/*.jsonl` |
| Cursor | `~/.cursor` | v aplikaci | `skills-cursor/`, `plugins/` | `mcp.json` → `mcpServers` | `hooks.json` | — (zeptej se) |
| Gemini CLI | `~/.gemini` | `settings.json` | `extensions/` | `settings.json` → `mcpServers` | `settings.json` → `hooks` | — |
| Copilot CLI | `~/.copilot` | `config.json` | `skills/`, `agents/` | `mcp-config.json` | `hooks/` | — |
| Hermes | `~/.hermes` | `config.yaml` | `skills/` | `config.yaml` / `hermes mcp list` | — | — |
| opencode | `~/.config/opencode` | `opencode.json` | `agents/*.md` | `opencode.json` → `mcp` | `plugins/` | — |
| Sdílené skilly | `~/.agents/skills` | — | `*/SKILL.md` | — | — | — |
| Aplikace (macOS) | `/Applications/*.app` | — | — | — | — | — |

Formát záznamu v `*.jsonl` (Claude Code): jeden JSON na řádek; odpověď modelu je řádek s
`message.role == "assistant"`, má `message.model`, `message.id`, `message.usage` a v
`message.content[]` části `type: "tool_use"` s `id`, `name`, `input`. **Pořadí polí se liší**
(u vlastních modelů přes bránu je `model` až za obsahem) — vždy parsuj JSON, nehledej textem.
Jedna odpověď i jedno volání nástroje se zapisují víckrát: počítej podle `message.id` / `tool_use.id`.

## Jak zjišťovat (vlastní průzkum)

1. **Profily:** vypiš kandidátní složky (`ls -d ~/.claude* ~/.codex* ~/.cursor ~/.gemini …`).
   Víc profilů je běžné — zeptej se, který je pracovní.
2. **Nastavení:** čti jen **klíče a názvy**, ne hodnoty: `jq 'keys'`, `jq '.mcpServers | keys'`,
   `jq '.enabledPlugins | keys'`, `grep -E '^\[mcp_servers\.' config.toml`. U `env` jen názvy klíčů
   (`ANTHROPIC_BASE_URL` přítomen = vlastní brána/model).
3. **Popisy vlastních skillů a agentů:** jen hlavička (`sed -n '1,6p' SKILL.md` → `description`).
   Podle popisu odhadni kategorii použití a zajímavá témata „Zeptej se mě na“.
4. **Aktivita:** počty a časy souborů (`find … -name '*.jsonl' -mtime -30 | wc -l`, `stat`), ne obsah.
5. **Logy konverzací:** jen strojově a jen agregace — malý skript, který parsuje JSON a vypíše
   **počty** (nástroje, modely, tokeny). Nikdy si nevypisuj text zpráv ani vstupy nástrojů.
6. **Automatika:** desítky konverzací ve stejnou hodinu každý den nebo víc než ~20 denně =
   pravděpodobně automatické běhy; čísla aktivity označ jako zkreslená a zeptej se.
7. **Co nezjistíš:** zeptej se (na co nástroj používá, co mu nejvíc pomáhá, tip pro ostatní).

## Nikdy nečti a nevypisuj

`auth.json`, `.env`, hodnoty `env` v nastavení, `history.jsonl`, sqlite databáze, text konverzací
a vstupy nástrojů, tokeny/klíče, URL a hosty MCP serverů, cesty k projektům a názvy repozitářů.
Složka nástroje ≠ používání (stavové pluginy jiných aplikací umí založit složky všech nástrojů):
nástroj bez konverzací za 30 dní dej na slide jen po potvrzení.
