import { readFileSync } from "node:fs";

const inject = readFileSync(new URL("../assets/inject/renderer-inject.js", import.meta.url), "utf8");

const requiredMarkers = [
  "function installTopSessionMenuActions()",
  "function injectTopSessionMenuItems(",
  "function topSessionMenuActionRef()",
  "data-codex-top-session-menu-item",
  "codex-top-session-menu-item",
];

const forbiddenMarkers = [
  "configureActionButton(moreButton, \"更多操作\", \"…\")",
  "group.appendChild(moreButton)",
  "installMoreButtonEvents(row, moreButton, openMoreMenu)",
  "installSessionMoreMenuAutoClose(row, moreMenu)",
];

const missing = requiredMarkers.filter((marker) => !inject.includes(marker));
const present = forbiddenMarkers.filter((marker) => inject.includes(marker));

if (missing.length || present.length) {
  if (missing.length) {
    console.error(`Missing header action markers:\n${missing.join("\n")}`);
  }
  if (present.length) {
    console.error(`Sidebar more action markers are still present:\n${present.join("\n")}`);
  }
  process.exit(1);
}

console.log("Sidebar actions moved to header validation passed");
