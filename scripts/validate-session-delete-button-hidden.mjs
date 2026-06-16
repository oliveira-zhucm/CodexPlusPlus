import { readFileSync } from "node:fs";

const inject = readFileSync(new URL("../assets/inject/renderer-inject.js", import.meta.url), "utf8");

const forbiddenMarkers = [
  "const deleteButton = document.createElement(\"button\")",
  "deleteButton.className = `${actionButtonClass} ${buttonClass}`",
  "configureSvgActionButton(deleteButton, \"删除\", trashIconSvg())",
  "group.appendChild(deleteButton)",
];

const present = forbiddenMarkers.filter((marker) => inject.includes(marker));

if (present.length) {
  console.error(`Session delete row button is still injected:\n${present.join("\n")}`);
  process.exit(1);
}

console.log("Session delete row button validation passed");
