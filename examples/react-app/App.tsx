import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge,
  Alert,
  Tabs,
  Toggle,
} from "@mkatogui/uds-react";
import type { TabItem } from "@mkatogui/uds-react";
import "@mkatogui/uds-react/styles.css";

// All 9 UDS palettes available for runtime switching
const PALETTES = [
  "minimal-saas",
  "ai-futuristic",
  "gradient-startup",
  "corporate",
  "apple-minimal",
  "illustration",
  "dashboard",
  "bold-lifestyle",
  "minimal-corporate",
] as const;

type Palette = (typeof PALETTES)[number];

/**
 * UDS React Example App
 *
 * Demonstrates all core components from @mkatogui/uds-react
 * with runtime palette switching and dark mode toggle.
 */
export default function App() {
  const [palette, setPalette] = useState<Palette>("minimal-saas");
  const [darkMode, setDarkMode] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Switch palette by setting the data-theme attribute on the root element
  const handlePaletteChange = (newPalette: Palette) => {
    setPalette(newPalette);
    document.documentElement.setAttribute("data-theme", newPalette);
  };

  // Toggle dark mode by adding/removing the dark class
  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    document.documentElement.classList.toggle("docs-dark", enabled);
  };

  // Tab items for the Tabs component demo
  const tabItems: TabItem[] = [
    { label: "Overview", value: "overview" },
    { label: "Components", value: "components" },
    { label: "Tokens", value: "tokens" },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>UDS React Example</h1>
      <p>
        A reference app showing every core component from{" "}
        <code>@mkatogui/uds-react</code>.
      </p>

      {/* ── Dark Mode Toggle ─────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Dark Mode</h2>
        <Toggle
          label="Enable dark mode"
          checked={darkMode}
          onChange={handleDarkModeToggle}
        />
      </section>

      {/* ── Palette Switcher ─────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Palette Switcher</h2>
        <p>
          Active palette: <Badge variant="default">{palette}</Badge>
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {PALETTES.map((p) => (
            <Button
              key={p}
              variant={p === palette ? "primary" : "ghost"}
              onClick={() => handlePaletteChange(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </section>

      {/* ── Button Variants ──────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Buttons</h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      {/* ── Card ─────────────────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Card</h2>
        <Card>
          <CardHeader>
            <CardTitle>Design Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Cards use semantic tokens for background, border, and shadow so
              they adapt automatically when you switch palettes or toggle dark
              mode.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Input ────────────────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Input</h2>
        <Input
          label="Your name"
          placeholder="Enter your name..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </section>

      {/* ── Badges ───────────────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Badges</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      </section>

      {/* ── Alert ────────────────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Alert</h2>
        <Alert variant="info">
          This is an informational alert rendered by the UDS Alert component. It
          adapts to the active palette and color mode.
        </Alert>
      </section>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Tabs</h2>
        <Tabs items={tabItems} defaultValue="overview" />
      </section>
    </div>
  );
}
