# 🤖 ai-agent-timmy

> Consolidated AI agent skills, Claude Code config, and Antigravity configuration for intelligent coding workflows.

A curated, production-ready collection of **AI-focused skills, agents, hooks, and commands** extracted from [everything-claude-code](https://github.com/affaan-m/everything-claude-code) — tailored for building **web apps**, **mobile apps (iOS/Android)**, and **AI-powered systems**.

---

## 📦 What's Inside

```
ai-agent-timmy/
├── .claude/                    # Claude Code configuration
│   ├── agents/                 # 8 specialized subagents
│   ├── commands/               # 14 slash commands
│   ├── contexts/               # 3 context modes (dev, review, research)
│   ├── rules/                  # 9 coding rules (common)
│   ├── settings.json           # Hooks configuration
│   └── skills/                 # 26 AI-focused skills
│       ├── agent-eval/         # Agent evaluation
│       ├── agent-harness-construction/
│       ├── agentic-engineering/  # Agentic design patterns
│       ├── ai-first-engineering/ # AI-first development
│       ├── ai-regression-testing/
│       ├── autonomous-loops/   # Sequential, DAG, PR loop patterns
│       ├── claude-api/         # Claude API integration
│       ├── claude-devfleet/    # Multi-instance Claude orchestration
│       ├── context-budget/     # Context window management
│       ├── continuous-agent-loop/
│       ├── continuous-learning/  # Session pattern extraction (v1)
│       ├── continuous-learning-v2/ # Instinct-based learning
│       ├── cost-aware-llm-pipeline/ # Token & cost optimization
│       ├── data-scraper-agent/ # Autonomous data scraping
│       ├── deep-research/      # Multi-step research workflows
│       ├── enterprise-agent-ops/ # Enterprise agent operations
│       ├── eval-harness/       # Verification loop evaluation
│       ├── exa-search/         # Exa search integration
│       ├── iterative-retrieval/ # Progressive context refinement
│       ├── market-research/    # Source-attributed research
│       ├── mcp-server-patterns/ # MCP server design
│       ├── nanoclaw-repl/      # REPL-based agent evaluation
│       ├── prompt-optimizer/   # Prompt engineering optimization
│       ├── regex-vs-llm-structured-text/ # Parsing decision framework
│       ├── search-first/       # Research-before-coding workflow
│       └── verification-loop/  # Continuous verification
├── antigravity/                # Antigravity (Gemini) configuration
│   └── settings.json           # Workflows & skills reference
├── docs/                       # Documentation
│   └── setup-guide.md          # Detailed setup instructions
├── CLAUDE.md                   # Project-level Claude config
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites
- [Claude Code](https://code.claude.com/) CLI installed
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) cloned (for hook scripts)

### Installation

```bash
# 1. Clone this repo
git clone https://github.com/dpthinh910/ai-agent-timmy.git

# 2. Symlink or copy the .claude directory to your user config
cp -r ai-agent-timmy/.claude/agents/* ~/.claude/agents/
cp -r ai-agent-timmy/.claude/commands/* ~/.claude/commands/
cp -r ai-agent-timmy/.claude/skills/* ~/.claude/skills/
cp -r ai-agent-timmy/.claude/rules/* ~/.claude/rules/
cp -r ai-agent-timmy/.claude/contexts/* ~/.claude/contexts/

# 3. Merge hooks from .claude/settings.json into ~/.claude/settings.json
# (or replace if starting fresh)
cp ai-agent-timmy/.claude/settings.json ~/.claude/settings.json

# 4. Optional: Set CLAUDE_PLUGIN_ROOT if your ECC location differs
export CLAUDE_PLUGIN_ROOT="$HOME/Developer/Projects/everything-claude-code"
```

---

## 🤖 Agents

| Agent | Purpose |
|-------|---------|
| `planner` | Feature planning and task decomposition |
| `architect` | System design and architecture decisions |
| `tdd-guide` | Test-driven development workflows |
| `code-reviewer` | Quality and security review |
| `security-reviewer` | Vulnerability analysis |
| `harness-optimizer` | AI harness configuration tuning |
| `loop-operator` | Autonomous loop execution |
| `docs-lookup` | Documentation and API lookup |

---

## ⚡ Commands

| Command | Purpose |
|---------|---------|
| `/plan` | Implementation planning |
| `/verify` | Run verification loop |
| `/checkpoint` | Save verification state |
| `/learn` | Extract patterns mid-session |
| `/learn-eval` | Extract, evaluate, and save patterns |
| `/eval` | Evaluate against criteria |
| `/multi-plan` | Multi-agent task decomposition |
| `/multi-execute` | Orchestrated multi-agent workflows |
| `/multi-workflow` | General multi-service workflows |
| `/orchestrate` | Multi-agent coordination |
| `/evolve` | Cluster instincts into skills |
| `/instinct-status` | View learned instincts |
| `/instinct-import` | Import instincts |
| `/instinct-export` | Export instincts |

---

## 🧠 Skills by Category

### AI Core
- **agentic-engineering** — Design patterns for AI agent systems
- **ai-first-engineering** — AI-first development methodology
- **autonomous-loops** — Sequential pipelines, PR loops, DAG orchestration
- **continuous-learning-v2** — Instinct-based learning with confidence scoring
- **cost-aware-llm-pipeline** — Token optimization, model routing, budget tracking
- **prompt-optimizer** — Prompt engineering and optimization
- **eval-harness** — Verification loop evaluation
- **verification-loop** — Continuous verification patterns

### AI Research
- **deep-research** — Multi-step research workflows
- **search-first** — Research-before-coding workflow
- **exa-search** — Exa search API integration
- **iterative-retrieval** — Progressive context refinement for subagents
- **market-research** — Source-attributed market and competitor research

### AI Infrastructure
- **claude-api** — Claude API patterns and integration
- **claude-devfleet** — Multi-instance Claude orchestration
- **mcp-server-patterns** — MCP server design patterns
- **enterprise-agent-ops** — Enterprise-scale agent operations
- **agent-harness-construction** — Building agent harnesses
- **continuous-agent-loop** — Continuous agent loop patterns
- **context-budget** — Context window budget management
- **data-scraper-agent** — Autonomous data scraping agents

### AI Quality
- **agent-eval** — Agent evaluation frameworks
- **ai-regression-testing** — AI-specific regression testing
- **regex-vs-llm-structured-text** — Decision framework for parsing approaches
- **nanoclaw-repl** — REPL-based agent evaluation

---

## 🪝 Hooks

Active hooks in `settings.json`:

| Lifecycle | Hook | Description |
|-----------|------|-------------|
| SessionStart | session-start | Load previous context |
| PreCompact | pre-compact | Save state before compaction |
| PostToolUse | console-warn | Warn on `console.log` |
| PostToolUse | post-edit-format | Auto-format (Biome/Prettier) |
| PostToolUse | post-edit-typecheck | TypeScript checks |
| PostToolUse | quality-gate | Quality gate checks |
| PostToolUse | observe | Continuous learning capture |
| Stop | check-console-log | Final console.log check |
| Stop | session-end | Persist session state |
| Stop | evaluate-session | Extract learning patterns |
| Stop | cost-tracker | Token/cost tracking |
| SessionEnd | session-end-marker | Lifecycle marker |

---

## 🔧 Antigravity (Gemini) Config

The `antigravity/settings.json` includes:
- **Workflow definitions** for web, mobile (iOS/Android), and AI agent development
- **Skills reference catalog** organized by category for quick lookup

---

## 📋 Coding Rules

Common rules applied across all projects:
- `coding-style.md` — Immutability, file organization
- `git-workflow.md` — Conventional commits, PR process
- `testing.md` — TDD, 80% coverage floor
- `performance.md` — Model selection, context management
- `patterns.md` — Design patterns, skeleton projects
- `hooks.md` — Hook architecture, TodoWrite
- `agents.md` — When to delegate to subagents
- `security.md` — Mandatory security checks
- `development-workflow.md` — Development workflow best practices

---

## 📖 Credits

Built on top of [everything-claude-code](https://github.com/affaan-m/everything-claude-code) by [@affaan-m](https://github.com/affaan-m) — the agent harness performance optimization system.

## 📄 License

MIT
