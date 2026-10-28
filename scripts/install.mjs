#!/usr/bin/env node
// Instala o actualiza el kit SDD en un proyecto: copia agentes, comandos y skills del kit a
// <proyecto>/.opencode/ respetando el prefijo de skills que ya use el proyecto.
// Uso: node scripts/install.mjs <ruta-del-proyecto> [--prefix <prefijo>] [--dry-run]
//   --prefix   prefijo para un proyecto nuevo (ej. gym → gym-sdd-*). Por defecto, el que ya
//              tenga el proyecto o, si no tiene, el del kit.
//   --dry-run  muestra qué haría sin escribir nada.
// Nunca toca AGENTS.md, MEMORY.md, docs/ ni specs/: eso es del proyecto, no del kit.
// Ajustes del proyecto: las reglas de `.opencode/sdd.local.json` se añaden AL FINAL de cada
// permiso del agente indicado (gana la última regla), así sobreviven a cada actualización.
// Archivos que el kit dejó de tener: se borran solo si los instaló el kit (manifiesto
// `.opencode/sdd-kit.json`); nunca se borra nada que no esté en él.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const prefixFlag = args.includes("--prefix") ? args[args.indexOf("--prefix") + 1] : undefined;
const targetArg = args.find((arg, i) => !arg.startsWith("--") && args[i - 1] !== "--prefix");
const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!targetArg) fail("Uso: node scripts/install.mjs <ruta-del-proyecto> [--prefix <prefijo>] [--dry-run]");
if (prefixFlag !== undefined && !valid.test(prefixFlag)) fail("El prefijo solo admite minúsculas, números y guiones.");

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(targetArg);
if (!existsSync(target) || !statSync(target).isDirectory()) fail(`No existe la carpeta ${target}.`);
if (target === kitRoot) fail("El destino es el propio kit: indica la carpeta de tu proyecto.");

const detectPrefix = (skillsDir) => {
  if (!existsSync(skillsDir)) return undefined;
  const match = readdirSync(skillsDir).map((name) => name.match(/^(.+)-sdd-bootstrap$/)).find(Boolean);
  return match?.[1];
};

const kitSkills = join(kitRoot, ".opencode", "skills");
const targetSkills = join(target, ".opencode", "skills");
const kitPrefix = detectPrefix(kitSkills);
if (!kitPrefix) fail("No encuentro la skill <prefijo>-sdd-bootstrap en el kit.");

const existingPrefix = detectPrefix(targetSkills);
if (existingPrefix && prefixFlag && prefixFlag !== existingPrefix) {
  fail(
    `El proyecto ya usa el prefijo "${existingPrefix}". Para cambiarlo, primero renómbralo desde el proyecto:\n` +
      `  node "${join(kitRoot, "scripts", "rename-prefix.mjs")}" ${prefixFlag} ${existingPrefix}`,
  );
}
const prefix = prefixFlag ?? existingPrefix ?? kitPrefix;
const from = `${kitPrefix}-sdd-`;
const to = `${prefix}-sdd-`;
const rename = (text) => text.split(from).join(to);

// Ajustes locales del proyecto: { "<agente>": { "<permiso>": { "<patrón>": "allow|ask|deny" } } }
const localPath = join(target, ".opencode", "sdd.local.json");
const kitAgents = readdirSync(join(kitRoot, ".opencode", "agents"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.slice(0, -3));
let local = {};
if (existsSync(localPath)) {
  try {
    local = JSON.parse(readFileSync(localPath, "utf8"));
  } catch (error) {
    fail(`No pude leer .opencode/sdd.local.json: ${error.message}`);
  }
  for (const [agent, perms] of Object.entries(local)) {
    if (agent.startsWith("$")) continue;
    if (!kitAgents.includes(agent)) fail(`sdd.local.json: el agente "${agent}" no existe (${kitAgents.join(", ")}).`);
    for (const [perm, rules] of Object.entries(perms)) {
      if (!/^[a-z_]+$/.test(perm)) fail(`sdd.local.json: permiso no válido "${perm}" en ${agent}.`);
      for (const [pattern, action] of Object.entries(rules)) {
        if (!["allow", "ask", "deny"].includes(action)) fail(`sdd.local.json: "${pattern}" en ${agent}.${perm} debe ser allow, ask o deny.`);
        if (pattern.includes('"')) fail(`sdd.local.json: el patrón ${pattern} no puede tener comillas.`);
      }
    }
  }
}

// Añade las reglas locales al final de cada permiso del frontmatter (gana la última regla).
const applyLocal = (agent, text) => {
  const perms = local[agent];
  if (!perms) return text;
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const close = lines.indexOf("---", 1);
  const start = lines.indexOf("permission:");
  if (lines[0] !== "---" || close < 0 || start < 0 || start > close) fail(`No encuentro el bloque permission de ${agent}.md.`);
  let end = start + 1;
  while (end < close && (lines[end].startsWith("  ") || lines[end].trim() === "")) end++;
  for (const [perm, rules] of Object.entries(perms)) {
    const added = [`    # sdd.local.json`, ...Object.entries(rules).map(([p, a]) => `    "${p}": ${a}`)];
    const at = lines.slice(start + 1, end).findIndex((line) => line.startsWith(`  ${perm}:`));
    if (at < 0) {
      lines.splice(end, 0, `  ${perm}:`, ...added);
      end += added.length + 1;
      continue;
    }
    const row = start + 1 + at;
    const scalar = lines[row].slice(`  ${perm}:`.length).trim();
    if (scalar) {
      lines.splice(row, 1, `  ${perm}:`, `    "*": ${scalar}`, ...added);
      end += added.length + 1;
      continue;
    }
    let last = row + 1;
    while (last < end && lines[last].startsWith("    ")) last++;
    lines.splice(last, 0, ...added);
    end += added.length;
  }
  return lines.join(eol);
};

const report = { created: [], updated: [], unchanged: [], removed: [] };
const installed = [];

const writeFile = (path, content) => {
  const label = relative(target, path);
  installed.push(label.split("\\").join("/"));
  if (!existsSync(path)) report.created.push(label);
  else if (readFileSync(path, "utf8") === content) return report.unchanged.push(label);
  else report.updated.push(label);
  if (dryRun) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

for (const folder of ["agents", "commands"]) {
  const source = join(kitRoot, ".opencode", folder);
  for (const file of walk(source)) {
    const name = relative(source, file);
    let content = rename(readFileSync(file, "utf8"));
    if (folder === "agents" && name.endsWith(".md")) content = applyLocal(name.slice(0, -3), content);
    writeFile(join(target, ".opencode", folder, name), content);
  }
}

const kitSkillNames = readdirSync(kitSkills).filter((name) => name.startsWith(from));
for (const name of kitSkillNames) {
  const source = join(kitSkills, name);
  for (const file of walk(source)) {
    const destination = join(targetSkills, name.replace(from, to), relative(source, file));
    if (file.endsWith(".md")) writeFile(destination, rename(readFileSync(file, "utf8")));
    else {
      installed.push(relative(target, destination).split("\\").join("/"));
      if (!dryRun) {
        mkdirSync(dirname(destination), { recursive: true });
        cpSync(file, destination);
      }
    }
  }
}

// Borra lo que instaló una versión anterior del kit y ya no existe en esta.
const manifestPath = join(target, ".opencode", "sdd-kit.json");
if (existsSync(manifestPath)) {
  let previous = [];
  try {
    previous = JSON.parse(readFileSync(manifestPath, "utf8")).files ?? [];
  } catch {
    console.log("⚠️  No pude leer .opencode/sdd-kit.json: no se borra nada.");
  }
  const keep = new Set(installed);
  for (const file of previous) {
    if (keep.has(file) || !/^\.opencode\/(agents|commands|skills)\//.test(file)) continue;
    const path = join(target, file);
    if (!existsSync(path)) continue;
    report.removed.push(file);
    if (dryRun) continue;
    unlinkSync(path);
    const folder = dirname(path);
    if (folder.startsWith(targetSkills) && folder !== targetSkills && readdirSync(folder).length === 0) rmdirSync(folder);
  }
}
const manifest = `${JSON.stringify({ kit: "SDD-AI-automation", prefix, files: [...installed].sort() }, null, 2)}\n`;
if (!dryRun) writeFileSync(manifestPath, manifest);

const installedSkills = new Set(kitSkillNames.map((name) => name.replace(from, to)));
const foreign = existsSync(targetSkills)
  ? readdirSync(targetSkills).filter((name) => name.startsWith(to) && !installedSkills.has(name))
  : [];

const configPath = join(target, "opencode.json");
let configNote = "";
if (existsSync(join(target, "opencode.jsonc")) && !existsSync(configPath)) {
  configNote = 'Tu proyecto usa opencode.jsonc: añade a mano "default_agent": "coordinator" (no lo edito para no perder tus comentarios).';
} else if (!existsSync(configPath)) {
  writeFile(configPath, readFileSync(join(kitRoot, "opencode.json"), "utf8"));
} else {
  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    if (config.default_agent === "coordinator") report.unchanged.push("opencode.json");
    else if (config.default_agent) configNote = `opencode.json tiene default_agent "${config.default_agent}": revisa si quieres "coordinator".`;
    else writeFile(configPath, `${JSON.stringify({ ...config, default_agent: "coordinator" }, null, 2)}\n`);
  } catch {
    configNote = 'No pude leer opencode.json (¿tiene comentarios?): añade a mano "default_agent": "coordinator".';
  }
}

console.log(`${dryRun ? "[simulación] " : ""}Kit SDD → ${target} (prefijo ${to}*)`);
for (const [title, files] of [["Nuevos", report.created], ["Actualizados", report.updated], ["Eliminados (ya no están en el kit)", report.removed]]) {
  if (files.length) console.log(`\n${title} (${files.length}):\n${files.map((f) => `  ${f}`).join("\n")}`);
}
console.log(`\nSin cambios: ${report.unchanged.length} archivos.`);
const localRules = Object.entries(local).filter(([agent]) => !agent.startsWith("$"));
if (localRules.length) {
  console.log("\nAjustes de .opencode/sdd.local.json aplicados (al final de cada permiso):");
  for (const [agent, perms] of localRules) {
    for (const [perm, rules] of Object.entries(perms)) {
      for (const [pattern, action] of Object.entries(rules)) console.log(`  ${agent}.${perm}: "${pattern}": ${action}`);
    }
  }
}
if (foreign.length) console.log(`\nSkills con tu prefijo que no vienen del kit (se conservan): ${foreign.join(", ")}`);
if (configNote) console.log(`\n⚠️  ${configNote}`);
if (!dryRun && (report.created.length || report.updated.length || report.removed.length)) console.log("\nReinicia OpenCode para que cargue los cambios.");
