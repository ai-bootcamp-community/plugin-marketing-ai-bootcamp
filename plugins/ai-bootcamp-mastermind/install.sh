#!/bin/sh
# Instalace skillu ai-bootcamp-mastermind z GitHubu do nalezených AI nástrojů.
# Co dělá: stáhne soubory skillu (SKILL.md, reference/, examples/, scripts/, templates/) do složek skillů
# nástrojů, které na počítači už jsou. Nic nespouští, nic neposílá.
# Spuštění: curl -fsSL <raw URL tohoto souboru> | sh
set -eu
RAW="https://raw.githubusercontent.com/ai-bootcamp-community/plugin-marketing-ai-bootcamp/main/plugins/ai-bootcamp-mastermind/skills/ai-bootcamp-mastermind"
NAME="ai-bootcamp-mastermind"
FILES="SKILL.md reference/temata.md reference/setupy.md reference/mereni.md reference/redakce.md examples/README.md examples/cc-konverzace.mjs examples/cc-nastaveni.mjs scripts/kontrola.mjs scripts/vloz.mjs templates/prezentace.html"

# Cíle po řádcích (cesty smí obsahovat mezery); jen nástroje, jejichž složka existuje, bez duplicit.
targets=""
add() { case "
$targets
" in *"
$1
"*) ;; *) targets="${targets:+$targets
}$1" ;; esac; }
[ -d "$HOME/.claude" ] && add "$HOME/.claude/skills"
[ -n "${CLAUDE_CONFIG_DIR:-}" ] && [ -d "$CLAUDE_CONFIG_DIR" ] && add "$CLAUDE_CONFIG_DIR/skills"
for d in "$HOME"/.claude-*; do [ -f "$d/settings.json" ] && add "$d/skills"; done
[ -d "$HOME/.codex" ] && add "$HOME/.codex/skills"
[ -n "${CODEX_HOME:-}" ] && [ -d "$CODEX_HOME" ] && add "$CODEX_HOME/skills"
[ -d "$HOME/.hermes" ] && add "$HOME/.hermes/skills"
[ -d "$HOME/.agents" ] && add "$HOME/.agents/skills"   # Copilot CLI, Gemini CLI a další
[ -z "$targets" ] && add "$HOME/.agents/skills"        # žádný známý nástroj → sdílená složka

tmp=$(mktemp -d)
for f in $FILES; do
  mkdir -p "$tmp/$(dirname "$f")"
  curl -fsSL "$RAW/$f" -o "$tmp/$f"
done

printf '%s\n' "$targets" | while IFS= read -r t; do
  for f in $FILES; do
    mkdir -p "$t/$NAME/$(dirname "$f")"
    cp "$tmp/$f" "$t/$NAME/$f"
  done
  echo "nainstalováno: $t/$NAME"
done
rm -rf "$tmp"
echo
echo "Hotovo. Spusť ve svém agentovi: /ai-bootcamp-mastermind"
