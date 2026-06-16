import { readFileSync } from "node:fs";

const inject = readFileSync(new URL("../assets/inject/renderer-inject.js", import.meta.url), "utf8");
const settings = readFileSync(new URL("../crates/codex-plus-core/src/settings.rs", import.meta.url), "utf8");
const manager = readFileSync(new URL("../apps/codex-plus-manager/src/App.tsx", import.meta.url), "utf8");

const requiredInjectMarkers = [
  "workspaceMarkdownReader: true",
  'workspaceMarkdownReader: "codexAppWorkspaceMarkdownReader"',
  "function refreshWorkspaceMarkdownReader()",
  "function installWorkspaceMarkdownReaderStyle()",
  "function findWorkspaceMarkdownSurfaces()",
  "function installMarkdownSelectionToolbar()",
  "function composerWriterInsertText(",
  "data-codex-md-reader",
  "codex-md-selection-toolbar",
  "Workspace Markdown Reader",
];

const requiredSettingsMarkers = [
  "codex_app_workspace_markdown_reader: bool",
  'rename = "codexAppWorkspaceMarkdownReader"',
  "codex_app_workspace_markdown_reader: true",
  'merge_bool_setting(target, source, "codexAppWorkspaceMarkdownReader")',
];

const requiredManagerMarkers = [
  "codexAppWorkspaceMarkdownReader: boolean",
  "codexAppWorkspaceMarkdownReader: true",
  'setEnhanceFlag("codexAppWorkspaceMarkdownReader", value)',
];

const missing = [
  ...requiredInjectMarkers
    .filter((marker) => !inject.includes(marker))
    .map((marker) => `assets/inject/renderer-inject.js missing ${marker}`),
  ...requiredSettingsMarkers
    .filter((marker) => !settings.includes(marker))
    .map((marker) => `crates/codex-plus-core/src/settings.rs missing ${marker}`),
  ...requiredManagerMarkers
    .filter((marker) => !manager.includes(marker))
    .map((marker) => `apps/codex-plus-manager/src/App.tsx missing ${marker}`),
];

if (missing.length) {
  console.error(missing.join("\n"));
  process.exit(1);
}

console.log("Workspace Markdown Reader validation passed");
