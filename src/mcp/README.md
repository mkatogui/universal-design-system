# UDS MCP Server

Model Context Protocol server for the Universal Design System. Exposes palette queries, component lookups, BM25 search, and token generation to AI coding tools.

## Prerequisites

- Node.js 18+
- Python 3.8+ (for the BM25 reasoning engine)

## Install

```bash
cd src/mcp
npm install
```

## Available Tools

| Tool | Description |
|------|-------------|
| `search_design_system` | BM25 search across 17 CSV databases. Returns domain detection, palette, components, patterns, and rules. |
| `get_palette` | Retrieve the full token set (colors, structural tokens) for one of the 9 palettes. |
| `get_component` | Look up a component by slug. Returns variants, sizes, states, props, and accessibility requirements. |
| `generate_tokens` | Run the full reasoning pipeline and return a complete design system spec (JSON or Tailwind). |
| `list_palettes` | List all 9 palettes with descriptions and key attributes. |
| `list_components` | List all 31+ components with names and categories. |

## Configuration

Add the server to your AI tool's MCP configuration. The `command` is `node` and the single argument is the absolute path to `index.js`.

### Claude Code

In your project's `.mcp.json` or `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### Cursor

In `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### VS Code (Copilot)

In `.vscode/mcp.json`:

```json
{
  "servers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### Windsurf

In `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### Zed

In Zed settings (`settings.json`):

```json
{
  "context_servers": {
    "universal-design-system": {
      "command": {
        "path": "node",
        "args": ["/absolute/path/to/src/mcp/index.js"]
      }
    }
  }
}
```

## Usage Examples

Once configured, your AI coding tool can call these tools directly:

**Search for a design system recommendation:**
```
search_design_system({ "query": "fintech dashboard for mobile banking" })
```

**Get a specific palette:**
```
get_palette({ "name": "corporate" })
```

**Look up a component:**
```
get_component({ "slug": "data-table" })
```

**Generate a full design system specification:**
```
generate_tokens({ "query": "saas landing page", "format": "json" })
generate_tokens({ "query": "ecommerce store", "format": "tailwind" })
```

**List all available palettes or components:**
```
list_palettes()
list_components()
```

## Architecture

```
AI Tool  -->  MCP stdio  -->  index.js  -->  Python subprocess (search/generate)
                                         -->  design-tokens.json (palette lookup)
                                         -->  components.csv (component lookup)
```

The server runs as a stdio process. AI tools spawn it and communicate via JSON-RPC over stdin/stdout per the MCP specification. Python scripts are invoked as subprocesses only for search and generation tasks; palette and component lookups read files directly for speed.
