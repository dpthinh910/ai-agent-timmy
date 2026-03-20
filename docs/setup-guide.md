# Setup Guide

## Prerequisites

1. **Claude Code CLI** — Install from [code.claude.com](https://code.claude.com/)
2. **everything-claude-code** — Clone the hook scripts runtime:
   ```bash
   git clone https://github.com/affaan-m/everything-claude-code.git ~/Developer/Projects/everything-claude-code
   ```
3. **Node.js** — Required for hook scripts (v18+)

## Installation

### Option A: Copy to Global Claude Config (Recommended)

```bash
# Clone ai-agent-timmy
git clone https://github.com/dpthinh910/ai-agent-timmy.git

# Copy components to ~/.claude/
mkdir -p ~/.claude/{agents,commands,skills,rules,contexts}
cp -r ai-agent-timmy/.claude/agents/* ~/.claude/agents/
cp -r ai-agent-timmy/.claude/commands/* ~/.claude/commands/
cp -r ai-agent-timmy/.claude/skills/* ~/.claude/skills/
cp -r ai-agent-timmy/.claude/rules/* ~/.claude/rules/
cp -r ai-agent-timmy/.claude/contexts/* ~/.claude/contexts/

# Merge or replace settings.json (contains hooks config)
cp ai-agent-timmy/.claude/settings.json ~/.claude/settings.json

# Set the ECC plugin root
echo 'export CLAUDE_PLUGIN_ROOT="$HOME/Developer/Projects/everything-claude-code"' >> ~/.zshrc
source ~/.zshrc
```

### Option B: Use as Project Config

```bash
# Clone directly into your project workspace
git clone https://github.com/dpthinh910/ai-agent-timmy.git
cd ai-agent-timmy
# Claude Code will pick up .claude/ automatically when opened in this directory
```

## Verification

```bash
# Check all components are installed
echo "Agents:" && ls ~/.claude/agents/ | wc -l
echo "Commands:" && ls ~/.claude/commands/ | wc -l
echo "Skills:" && ls ~/.claude/skills/ | wc -l
echo "Rules:" && ls ~/.claude/rules/ | wc -l
echo "Contexts:" && ls ~/.claude/contexts/ | wc -l
```

## Updating

```bash
cd ai-agent-timmy
git pull origin main
# Re-copy updated files to ~/.claude/ as needed
```
