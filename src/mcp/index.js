#!/usr/bin/env node

/**
 * Universal Design System -- MCP Server
 *
 * Exposes UDS capabilities (search, palettes, components, token generation)
 * to AI coding tools via the Model Context Protocol over stdio transport.
 *
 * Usage:
 *   node src/mcp/index.js
 *
 * Configure in your AI tool's MCP settings:
 *   {
 *     "mcpServers": {
 *       "universal-design-system": {
 *         "command": "node",
 *         "args": ["<path-to-repo>/src/mcp/index.js"]
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..", "..");
const TOKENS_PATH = resolve(PROJECT_ROOT, "tokens", "design-tokens.json");
const FIGMA_TOKENS_PATH = resolve(PROJECT_ROOT, "tokens", "figma-tokens.json");
const COMPONENTS_CSV = resolve(PROJECT_ROOT, "src", "data", "components.csv");
const PRODUCTS_CSV = resolve(PROJECT_ROOT, "src", "data", "products.csv");
const PATTERNS_CSV = resolve(PROJECT_ROOT, "src", "data", "patterns.csv");
const UI_REASONING_CSV = resolve(PROJECT_ROOT, "src", "data", "ui-reasoning.csv");
const ANTI_PATTERNS_CSV = resolve(PROJECT_ROOT, "src", "data", "anti-patterns.csv");
const SEARCH_SCRIPT = resolve(PROJECT_ROOT, "src", "scripts", "search.py");
const GENERATE_SCRIPT = resolve(
  PROJECT_ROOT,
  "src",
  "scripts",
  "design_system.py",
);

// ---------------------------------------------------------------------------
// Valid palettes
// ---------------------------------------------------------------------------

const VALID_PALETTES = [
  "minimal-saas",
  "ai-futuristic",
  "gradient-startup",
  "corporate",
  "apple-minimal",
  "illustration",
  "dashboard",
  "bold-lifestyle",
  "minimal-corporate",
];

const PALETTE_DESCRIPTIONS = {
  "minimal-saas":
    "Clean SaaS aesthetic with neutral tones and blue accents. Best for B2B software, productivity tools, and developer platforms.",
  "ai-futuristic":
    "Dark-mode forward with neon accents and deep purples. Best for AI/ML products, developer tools, and crypto platforms.",
  "gradient-startup":
    "Vibrant gradients with purple-to-pink energy. Best for consumer startups, creative tools, and social platforms.",
  corporate:
    "Traditional business palette with navy and conservative tones. Best for finance, insurance, enterprise, and government.",
  "apple-minimal":
    "Ultra-clean with generous whitespace and precise typography. Best for premium consumer products, hardware, and luxury.",
  illustration:
    "Warm, friendly palette with hand-drawn character. Best for education, kids products, onboarding, and community platforms.",
  dashboard:
    "Data-dense with high contrast and status colors. Best for analytics, admin panels, monitoring, and DevOps.",
  "bold-lifestyle":
    "High-energy editorial with strong brand identity. Best for fashion, sports, media, and entertainment.",
  "minimal-corporate":
    "Research-forward editorial with warm neutrals. Best for consulting, professional services, and content-heavy sites.",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run a Python script and return its stdout.
 */
function runPython(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      "python3",
      [scriptPath, ...args],
      { cwd: PROJECT_ROOT, timeout: 30_000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          // Provide a clear message when python3 is not available
          if (error.code === "ENOENT") {
            reject(
              new Error(
                "python3 not found. The UDS reasoning engine requires Python 3 to be installed and on PATH.",
              ),
            );
            return;
          }
          reject(new Error(stderr || error.message));
          return;
        }
        resolve(stdout);
      },
    );
  });
}

/**
 * Parse a simple CSV string into an array of objects.
 * Handles quoted fields containing commas and newlines.
 */
function parseCSV(text) {
  const lines = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "\n" && !inQuotes) {
      if (current.trim()) {
        lines.push(current);
      }
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    lines.push(current);
  }

  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || "";
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Split a single CSV line by commas, respecting quoted fields.
 */
function splitCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Load and cache the design tokens JSON file.
 */
let _tokensCache = null;
async function loadTokens() {
  if (_tokensCache) return _tokensCache;
  const raw = await readFile(TOKENS_PATH, "utf-8");
  _tokensCache = JSON.parse(raw);
  return _tokensCache;
}

/**
 * Load and cache the components CSV.
 */
let _componentsCache = null;
async function loadComponents() {
  if (_componentsCache) return _componentsCache;
  const raw = await readFile(COMPONENTS_CSV, "utf-8");
  _componentsCache = parseCSV(raw);
  return _componentsCache;
}

/**
 * Load and cache the anti-patterns CSV.
 */
let _antiPatternsCache = null;
async function loadAntiPatterns() {
  if (_antiPatternsCache) return _antiPatternsCache;
  const raw = await readFile(ANTI_PATTERNS_CSV, "utf-8");
  _antiPatternsCache = parseCSV(raw);
  return _antiPatternsCache;
}

/**
 * Extract palette tokens from the design-tokens.json theme section.
 * Returns an object with color, structural, and dark-mode tokens.
 */
function extractPaletteTokens(tokens, paletteName) {
  const theme = tokens.theme || {};
  const paletteData = theme[paletteName];
  if (!paletteData) return null;

  const result = {
    name: paletteName,
    description: paletteData.$description || PALETTE_DESCRIPTIONS[paletteName] || "",
    light: {},
    dark: {},
    structural: {},
  };

  for (const [key, val] of Object.entries(paletteData)) {
    if (key === "$description") continue;
    if (key === "$structural") {
      result.structural = { ...val };
      continue;
    }
    if (typeof val !== "object" || !val.$value) continue;

    // Sort into light vs dark based on key suffix
    if (key.endsWith("_dark")) {
      const lightKey = key.replace(/_dark$/, "");
      result.dark[lightKey] = val.$value;
    } else {
      result.light[key] = val.$value;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Resource definitions
// ---------------------------------------------------------------------------

/**
 * Resource registry — single source of truth for URI, file path, and metadata.
 * The MCP-facing resource list is derived from this via RESOURCES below.
 */
const RESOURCE_REGISTRY = [
  {
    uri: "tokens://design-tokens",
    filePath: TOKENS_PATH,
    name: "Design Tokens",
    description: "W3C DTCG design tokens — 496 tokens across 9 palettes, 2 modes (light/dark). Source of truth for all colors, typography, spacing, motion, shadows, and structural tokens.",
    mimeType: "application/json",
  },
  {
    uri: "tokens://figma-tokens",
    filePath: FIGMA_TOKENS_PATH,
    name: "Figma Tokens",
    description: "Figma-compatible design tokens for import into Figma Token Studio. Mirrors design-tokens.json in Figma's expected format.",
    mimeType: "application/json",
  },
  {
    uri: "csv://components",
    filePath: COMPONENTS_CSV,
    name: "Components Database",
    description: "31+ UI components with variants, sizes, states, accessibility requirements, and usage guidance.",
    mimeType: "text/csv",
  },
  {
    uri: "csv://products",
    filePath: PRODUCTS_CSV,
    name: "Products Database",
    description: "Product templates mapping domains to recommended components, patterns, and palettes.",
    mimeType: "text/csv",
  },
  {
    uri: "csv://patterns",
    filePath: PATTERNS_CSV,
    name: "Patterns Database",
    description: "UI/UX patterns with descriptions, use cases, and component compositions.",
    mimeType: "text/csv",
  },
  {
    uri: "csv://ui-reasoning",
    filePath: UI_REASONING_CSV,
    name: "UI Reasoning Rules",
    description: "165 conditional rules (IF sector=X THEN palette=Y) that drive the reasoning engine. Sorted by priority.",
    mimeType: "text/csv",
  },
];

/** MCP-facing resource list (without internal filePath). */
const RESOURCES = RESOURCE_REGISTRY.map(({ filePath: _, ...rest }) => rest);

/** O(1) URI lookup for resource reads. */
const RESOURCE_BY_URI = new Map(RESOURCE_REGISTRY.map((r) => [r.uri, r]));

// ---------------------------------------------------------------------------
// Prompt definitions
// ---------------------------------------------------------------------------

const PROMPTS = [
  {
    name: "design-system-for-domain",
    description: "Design a complete UI for a given domain. Instructs the AI to use UDS tools to generate a full design system specification.",
    arguments: [
      {
        name: "domain",
        description: "The product domain, e.g. 'fintech dashboard', 'healthcare portal', 'saas landing page'",
        required: true,
      },
    ],
  },
  {
    name: "wcag-audit",
    description: "Audit a component for WCAG 2.1 AA compliance. Checks contrast ratios, keyboard navigation, ARIA attributes, and focus management.",
    arguments: [
      {
        name: "component",
        description: "The component slug to audit, e.g. 'button', 'modal', 'data-table'",
        required: true,
      },
    ],
  },
  {
    name: "palette-comparison",
    description: "Compare UDS palettes for a given domain. Analyzes which palettes are suitable and why, with token-level differences.",
    arguments: [
      {
        name: "domain",
        description: "The product domain to compare palettes for, e.g. 'fintech', 'education', 'ecommerce'",
        required: true,
      },
    ],
  },
  {
    name: "component-selection",
    description: "Select the right UDS components for a product type. Returns a prioritized list with rationale.",
    arguments: [
      {
        name: "product_type",
        description: "The product type, e.g. 'dashboard', 'landing-page', 'mobile-app', 'admin-panel'",
        required: true,
      },
    ],
  },
];

/**
 * Generate prompt messages for a given prompt name and arguments.
 */
function buildPromptMessages(name, args) {
  switch (name) {
    case "design-system-for-domain":
      return {
        description: `Design a complete UI system for: ${args.domain}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Design a complete UI for "${args.domain}" using the Universal Design System.\n\n` +
                `Follow these steps:\n` +
                `1. Use the search_design_system tool with query "${args.domain}" to detect the domain and get recommendations.\n` +
                `2. Use get_palette to retrieve the full token set for the recommended palette.\n` +
                `3. Use list_components to see all available components, then use get_component for each recommended component.\n` +
                `4. Use get_anti_patterns to check what to avoid for this sector.\n` +
                `5. Use get_foundation_tokens to get the spacing, typography, motion, and z-index tokens.\n\n` +
                `Compile everything into a complete design system specification including:\n` +
                `- Palette tokens (light + dark mode)\n` +
                `- Component list with variants and accessibility notes\n` +
                `- Layout patterns and spacing rules\n` +
                `- Typography scale and font pairings\n` +
                `- Anti-patterns to avoid\n` +
                `- Implementation notes for the chosen framework`,
            },
          },
        ],
      };

    case "wcag-audit":
      return {
        description: `WCAG 2.1 AA audit for component: ${args.component}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Perform a WCAG 2.1 AA accessibility audit on the "${args.component}" component from the Universal Design System.\n\n` +
                `Steps:\n` +
                `1. Use get_component with slug "${args.component}" to retrieve its full specification.\n` +
                `2. Use list_palettes to get all palettes, then check the component's contrast ratios against each palette.\n` +
                `3. Use get_foundation_tokens to verify spacing meets touch-target minimums.\n\n` +
                `Audit checklist:\n` +
                `- Color contrast: 4.5:1 for body text, 3:1 for large text and UI elements\n` +
                `- Keyboard navigation: Tab order, focus indicators, escape to close\n` +
                `- ARIA attributes: Roles, labels, live regions, state announcements\n` +
                `- Focus management: Focus trap for modals, return focus on close\n` +
                `- Motion: All animations wrapped in prefers-reduced-motion\n` +
                `- Touch targets: Minimum 44x44px for interactive elements\n\n` +
                `Provide a pass/fail verdict for each criterion with specific remediation steps for any failures.`,
            },
          },
        ],
      };

    case "palette-comparison":
      return {
        description: `Compare palettes for domain: ${args.domain}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Compare all Universal Design System palettes for the "${args.domain}" domain.\n\n` +
                `Steps:\n` +
                `1. Use search_design_system with query "${args.domain}" to see which palette the reasoning engine recommends.\n` +
                `2. Use list_palettes to get all 9 palettes with descriptions.\n` +
                `3. Use get_palette for the top 3 most relevant palettes to compare their tokens side-by-side.\n` +
                `4. Use get_anti_patterns to check if any palette choices would trigger anti-patterns for this sector.\n\n` +
                `For each palette, evaluate:\n` +
                `- Brand alignment: Does the visual tone match the domain's expectations?\n` +
                `- Contrast compliance: Will it pass WCAG 2.1 AA in both light and dark mode?\n` +
                `- Structural fit: Is the border-radius, shadow style, and font-display appropriate?\n` +
                `- Dark mode quality: Does the dark variant maintain readability?\n\n` +
                `Provide a ranked recommendation with reasoning for the top choice.`,
            },
          },
        ],
      };

    case "component-selection":
      return {
        description: `Select components for product type: ${args.product_type}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Select the right Universal Design System components for a "${args.product_type}" product.\n\n` +
                `Steps:\n` +
                `1. Use search_design_system with query "${args.product_type}" to get domain-matched component recommendations.\n` +
                `2. Use list_components to see all available components.\n` +
                `3. Use get_component for each recommended component to get full details.\n` +
                `4. Use get_foundation_tokens to understand the spacing and layout system.\n\n` +
                `Organize the components into:\n` +
                `- **Must-have**: Core components essential for this product type\n` +
                `- **Recommended**: Components that enhance the experience\n` +
                `- **Optional**: Nice-to-have components for advanced features\n\n` +
                `For each component, include:\n` +
                `- Which variants to use and why\n` +
                `- Accessibility requirements specific to this product type\n` +
                `- Layout placement recommendations\n` +
                `- State management considerations`,
            },
          },
        ],
      };

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "search_design_system",
    description:
      "Search the Universal Design System using BM25 ranking across 17 CSV databases (1500+ rows). " +
      "Returns domain detection (sector + product type), recommended palette, matched components, " +
      "patterns, typography, styles, anti-patterns, and applied reasoning rules. " +
      "Use this for queries like 'fintech dashboard', 'saas landing page', 'healthcare portal'.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Design system search query, e.g. 'fintech dashboard', 'kids education app', 'ecommerce mobile store'",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_palette",
    description:
      "Get the full token set for a specific UDS palette. Returns light-mode colors, dark-mode colors, " +
      "and structural tokens (border-radius, shadow, font-display). " +
      "Valid palettes: minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, " +
      "illustration, dashboard, bold-lifestyle, minimal-corporate.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Palette name. One of: " + VALID_PALETTES.join(", "),
          enum: VALID_PALETTES,
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_component",
    description:
      "Get detailed information about a UDS component by its slug. Returns variants, sizes, states, " +
      "props, accessibility requirements, and usage guidance. " +
      "Example slugs: button, hero, modal, data-table, command-palette, side-nav.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description:
            "Component slug, e.g. 'button', 'hero', 'modal', 'data-table', 'input', 'tabs'",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "generate_tokens",
    description:
      "Generate a complete design system specification for a given domain query. " +
      "Runs the full reasoning pipeline: domain detection, BM25 search, rule application, " +
      "and token resolution. Returns palette tokens, recommended components, patterns, " +
      "typography, anti-patterns, and design rules. Supports JSON, Tailwind CSS, or CSS-in-JS output.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Domain query for design system generation, e.g. 'saas landing page', 'healthcare portal'",
        },
        format: {
          type: "string",
          description: "Output format: 'json' for structured data, 'tailwind' for Tailwind CSS config preset, 'css-in-js' for styled-components/Emotion theme object",
          enum: ["json", "tailwind", "css-in-js"],
          default: "json",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_palettes",
    description:
      "List all 9 UDS palettes with their descriptions and key attributes. " +
      "Use this to understand available palettes before selecting one.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_components",
    description:
      "List all 31+ UDS components with their names, slugs, and categories. " +
      "Use this to discover available components before requesting details with get_component.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_anti_patterns",
    description:
      "Get anti-patterns to avoid for a given sector. Returns patterns that are inappropriate or harmful " +
      "for the sector, with severity levels (critical, high, medium), descriptions, and recommended alternatives. " +
      "Example sectors: finance, healthcare, education, ecommerce, government.",
    inputSchema: {
      type: "object",
      properties: {
        sector: {
          type: "string",
          description:
            "The sector to filter anti-patterns for, e.g. 'finance', 'healthcare', 'education', 'ecommerce'",
        },
      },
      required: ["sector"],
    },
  },
  {
    name: "get_foundation_tokens",
    description:
      "Get the palette-independent foundation tokens from the design system. Returns spacing (4px base, 12-step scale), " +
      "motion (durations and easing curves), typography (body font, font sizes, line heights, font weights), " +
      "z-index layers (dropdown=10 through system=100), and opacity values. " +
      "These tokens are locked and consistent across all 9 palettes.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function handleSearchDesignSystem(args) {
  const query = args.query;
  if (!query || typeof query !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'query' is required and must be a string." }] };
  }

  const stdout = await runPython(SEARCH_SCRIPT, [query, "--json"]);
  const data = JSON.parse(stdout);
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

async function handleGetPalette(args) {
  const name = args.name;
  if (!name || typeof name !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'name' is required and must be a string." }] };
  }
  if (!VALID_PALETTES.includes(name)) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Invalid palette '${name}'. Valid palettes: ${VALID_PALETTES.join(", ")}`,
        },
      ],
    };
  }

  const tokens = await loadTokens();
  const palette = extractPaletteTokens(tokens, name);

  if (!palette) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Palette '${name}' not found in design-tokens.json. This may indicate a corrupted tokens file.`,
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(palette, null, 2) }],
  };
}

async function handleGetComponent(args) {
  const slug = args.slug;
  if (!slug || typeof slug !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'slug' is required and must be a string." }] };
  }

  const components = await loadComponents();
  const match = components.find(
    (c) => c.slug === slug || c.css_class === slug || c.name.toLowerCase() === slug.toLowerCase(),
  );

  if (!match) {
    const available = components.map((c) => c.slug).filter(Boolean).join(", ");
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Component '${slug}' not found. Available slugs: ${available}`,
        },
      ],
    };
  }

  const result = {
    id: match.id,
    name: match.name,
    slug: match.slug,
    category: match.category,
    css_class: match.css_class ? `uds-${match.css_class}` : undefined,
    variants: match.variants ? match.variants.split(";").map((v) => v.trim()) : [],
    sizes: match.sizes ? match.sizes.split(";").map((s) => s.trim()) : [],
    states: match.states ? match.states.split(";").map((s) => s.trim()) : [],
    props: match.props ? match.props.split(";").map((p) => p.trim()) : [],
    accessibility: match.accessibility ? match.accessibility.split(";").map((a) => a.trim()) : [],
    use_when: match.use_when || "",
    dont_use_when: match.dont_use_when || "",
  };

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

async function handleGenerateTokens(args) {
  const query = args.query;
  if (!query || typeof query !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'query' is required and must be a string." }] };
  }

  const format = args.format || "json";
  if (!["json", "tailwind", "css-in-js"].includes(format)) {
    return {
      isError: true,
      content: [{ type: "text", text: "Parameter 'format' must be 'json', 'tailwind', or 'css-in-js'." }],
    };
  }

  const stdout = await runPython(GENERATE_SCRIPT, [query, "--format", format]);

  // For JSON output, parse and re-serialize to validate it
  if (format === "json") {
    const data = JSON.parse(stdout);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }

  // Tailwind and CSS-in-JS output are plain text (JS config/module)
  return {
    content: [{ type: "text", text: stdout }],
  };
}

async function handleListPalettes() {
  const tokens = await loadTokens();
  const palettes = VALID_PALETTES.map((name) => {
    const paletteData = (tokens.theme || {})[name] || {};
    const structural = paletteData.$structural || {};
    return {
      name,
      description: PALETTE_DESCRIPTIONS[name] || paletteData.$description || "",
      shape: structural.shape || null,
      radius: structural["radius-md"] || null,
      font_display: structural["font-display"] || null,
    };
  });

  return {
    content: [{ type: "text", text: JSON.stringify(palettes, null, 2) }],
  };
}

async function handleListComponents() {
  const components = await loadComponents();
  const list = components.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    category: c.category,
    css_class: c.css_class ? `uds-${c.css_class}` : undefined,
  }));

  return {
    content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
  };
}

async function handleGetAntiPatterns(args) {
  const sector = args.sector;
  if (!sector || typeof sector !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'sector' is required and must be a string." }] };
  }

  const rows = await loadAntiPatterns();
  const needle = sector.toLowerCase();
  const matches = rows.filter(
    (r) => r.sector && r.sector.toLowerCase() === needle,
  );

  if (matches.length === 0) {
    const sectors = [...new Set(rows.map((r) => r.sector).filter(Boolean))];
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `No anti-patterns found for sector '${sector}'. Available sectors: ${sectors.join(", ")}`,
        },
      ],
    };
  }

  const result = matches.map((r) => ({
    id: r.id,
    sector: r.sector,
    anti_pattern: r.anti_pattern,
    severity: r.severity,
    description: r.description,
    alternative: r.alternative,
    example: r.example,
  }));

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

async function handleGetFoundationTokens() {
  const tokens = await loadTokens();

  const foundation = {};
  const foundationKeys = [
    "spacing",
    "motion",
    "typography",
    "zIndex",
    "opacity",
    "font-weight",
    "line-height",
  ];

  for (const key of foundationKeys) {
    if (tokens[key]) {
      foundation[key] = tokens[key];
    }
  }

  return {
    content: [{ type: "text", text: JSON.stringify(foundation, null, 2) }],
  };
}

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: "universal-design-system",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: RESOURCES };
});

// Read a resource by URI
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const entry = RESOURCE_BY_URI.get(uri);

  if (!entry) {
    throw new Error(
      `Unknown resource URI: ${uri}. Available: ${RESOURCES.map((r) => r.uri).join(", ")}`,
    );
  }

  const content = await readFile(entry.filePath, "utf-8");

  return {
    contents: [
      {
        uri,
        mimeType: entry.mimeType,
        text: content,
      },
    ],
  };
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts: PROMPTS };
});

// Get a prompt by name
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const prompt = PROMPTS.find((p) => p.name === name);
  if (!prompt) {
    throw new Error(
      `Unknown prompt: ${name}. Available: ${PROMPTS.map((p) => p.name).join(", ")}`,
    );
  }

  // Validate required arguments
  for (const arg of prompt.arguments || []) {
    if (arg.required && (!args || !args[arg.name])) {
      throw new Error(`Missing required argument '${arg.name}' for prompt '${name}'.`);
    }
  }

  const result = buildPromptMessages(name, args || {});
  if (!result) {
    throw new Error(`Failed to build prompt messages for '${name}'.`);
  }

  return result;
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_design_system":
        return await handleSearchDesignSystem(args);
      case "get_palette":
        return await handleGetPalette(args);
      case "get_component":
        return await handleGetComponent(args);
      case "generate_tokens":
        return await handleGenerateTokens(args);
      case "list_palettes":
        return await handleListPalettes();
      case "list_components":
        return await handleListComponents();
      case "get_anti_patterns":
        return await handleGetAntiPatterns(args);
      case "get_foundation_tokens":
        return await handleGetFoundationTokens();
      default:
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}. Available tools: ${TOOLS.map((t) => t.name).join(", ")}`,
            },
          ],
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
    };
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal: MCP server failed to start:", error.message);
  process.exit(1);
});
