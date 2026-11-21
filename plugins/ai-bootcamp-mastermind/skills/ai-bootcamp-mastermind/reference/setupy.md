# Normované setupy · kde co leží

Cesty se mezi verzemi nástrojů mění. Když něco nesedí, podívej se, co ve složce skutečně je,
a neodhaduj. Čti **klíče a názvy**, ne hodnoty (`jq 'keys'`, `grep -E '^\['`). Co je ověřené,
má datum; zbytek je „neověřeno“ a ověř si to na místě nebo se zeptej.

## Claude Code (ověřeno 2026-11-21)

Profily: `~/.claude` a další `~/.claude-*` (přepis `CLAUDE_CONFIG_DIR`). Víc profilů je běžné
(práce/osobní) — zeptej se, který je který a jestli chce oba.

| Co | Kde |
| --- | --- |
| Model | `settings.json` → `model` |
| Skilly | `skills/*/SKILL.md` (hlavička `description`); pluginy `settings.json` → `enabledPlugins` |
| Vlastní agenti | `agents/*.md` |
| MCP | `<profil>/.claude.json` → `mcpServers` a `projects.*.mcpServers`; výchozí profil `~/.claude.json`. **Konektory claude.ai** (Gmail, Drive…) tam nejsou — jen v logu jako `mcp__claude_ai_<název>__*` |
| Hooky | `settings.json` → `hooks` (událost → seznam) |
| Mantinely | `settings.json` → `permissions.{allow,deny,ask,defaultMode}` |
| Instrukce | `<profil>/CLAUDE.md`, projektové `CLAUDE.md` / `AGENTS.md` v repech (cesty k projektům ber z `cwd` v logu, ven je nepiš) |
| Memories | `projects/<projekt>/memory/*.md`, index `MEMORY.md` |
| Konverzace | `projects/<projekt>/<session>.jsonl`; pomocníci `…/<session>/subagents/*.jsonl` |
| Plány | `plans/` (pokud existuje) |
| Env | `settings.json` → `env` — **jen názvy klíčů** (`ANTHROPIC_BASE_URL` = vlastní brána/model) |

## Codex (ověřeno 2026-11-21 na dvou profilech)

Profily: `~/.codex`, `~/.codex-*` (přepis `CODEX_HOME`).

| Co | Kde |
| --- | --- |
| Model | `config.toml` → `model` |
| Skilly, pluginy | `skills/*/SKILL.md`; `config.toml` → `[plugins."…"]` s `enabled` |
| MCP | `config.toml` → `[mcp_servers.<název>]` |
| Hooky | `hooks.json` |
| Instrukce | `AGENTS.md` v profilu a v repech |
| Konverzace | `sessions/**/*.jsonl`: řádek `{timestamp, type, payload}`; typy `session_meta`, `response_item` (`message`, `function_call`, `custom_tool_call`, `reasoning`), `event_msg` (`token_count`, `task_started`…), `token_usage_record`, `turn_context` |
| Komprimace | řádek `type: "compacted"` (u 4 z 60 sessions) |

**Nikdy nečti:** `auth.json`, `history.jsonl`, `*.sqlite`. Přesné pole „zpráva člověka“ v Codexu
(role v `response_item:message`) je **neověřené** — ověř na jednom souboru přes klíče, ne obsah.

## Ostatní (neověřeno)

| Nástroj | Kořen | Skilly | MCP | Konverzace |
| --- | --- | --- | --- | --- |
| Hermes | `~/.hermes` | `skills/` (i kategorie v podsložkách) | `config.yaml` → `mcp_servers` | SQLite `~/.hermes/state.db` — **nečti přímo**; počet přes `hermes sessions list`, jinak se zeptej |
| Cursor | `~/.cursor` | `skills-cursor/`, `plugins/` | `mcp.json` → `mcpServers` | — (zeptej se) |
| Gemini CLI | `~/.gemini` | `extensions/` | `settings.json` → `mcpServers` | — |
| Copilot CLI | `~/.copilot` | `skills/`, `agents/` | `mcp-config.json` | — |
| opencode | `~/.config/opencode` | `agents/*.md` | `opencode.json` → `mcp` | — |
| Sdílené skilly | `~/.agents/skills` | `*/SKILL.md` | — | — |

Složka nástroje ≠ používání (aplikace umí založit složky cizích nástrojů). Nástroj bez konverzací
za 30 dní ukaž jen po potvrzení.

## Druhý mozek (second brain) — jak ho poznat

Žádné pevné místo. Hledej v tomhle pořadí:
1. Cesty a složky odkazované z `CLAUDE.md` / `AGENTS.md` (věty typu „zapiš do…“, „čti nejdřív…“).
2. Memory složky Claude Code (`projects/*/memory/`).
3. Typické názvy v domovské složce: `brain/`, `notes/`, `second-brain/`, Obsidian vault (složka s `.obsidian/`).
4. Zeptej se: „Máš místo, kam si AI zapisuje poznatky?“

Ukazuj **strukturu relativně** (`brain/projects/`, „složka se schůzkami“) a typy záznamů, nikdy
absolutní cestu ani domovskou složku.
