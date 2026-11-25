#!/usr/bin/env node
// Instala o actualiza el kit SDD en un proyecto, para OpenCode (.opencode/), Claude Code
// (.claude/) o ambos, respetando el prefijo de skills que ya use el proyecto.
// Uso: node scripts/install.mjs <ruta-del-proyecto> [--target auto|opencode|claude|both] [--prefix <prefijo>] [--dry-run]
//   --target   auto (por defecto): detecta la herramienta por lo que ya hay en el proyecto
//              (.opencode/, opencode.json → OpenCode; .claude/, CLAUDE.md → Claude Code); si no
//              hay nada, por los programas instalados (`opencode`, `claude`); si tampoco, ambos.
//   --prefix   prefijo para un proyecto nuevo (ej. gym → gym-sdd-*). Por defecto, el que ya
//              tenga el proyecto o, si no tiene, el del kit.
//   --dry-run  muestra qué haría sin escribir nada.
// La fuente es una sola: .opencode/ del kit. Para Claude Code se convierte al instalar (ver
// scripts/lib/claude.mjs) y los permisos de cada agente los aplica .claude/hooks/sdd-guard.mjs.
// Nunca toca AGENTS.md, MEMORY.md, docs/ ni specs/: eso es del proyecto, no del kit.
// Ajustes del proyecto: las reglas de `.opencode/sdd.local.json` (o `.claude/sdd.local.json`)
// se añaden AL FINAL de cada permiso del agente indicado (gana la última regla), así
// sobreviven a cada actualización y valen para las dos herramientas.
// Archivos que el kit dejó de tener: se borran solo si los instaló el kit (manifiestos
// `.opencode/sdd-kit.json` y `.claude/sdd-kit.json`); nunca se borra nada que no esté en ellos.
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
import { delimiter, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { convertAgent, convertCommand, mergeSettings } from "./lib/claude.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const prefixFlag = flag("--prefix");
const toolFlag = flag("--target") ?? "auto";
const targetArg = args.find((arg, i) => !arg.startsWith("--") && !["--prefix", "--target"].includes(args[i - 1]));
const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const usage = "Uso: node scripts/install.mjs <ruta-del-proyecto> [--target auto|opencode|claude|both] [--prefix <prefijo>] [--dry-run]";
if (!targetArg) fail(usage);
if (!["auto", "opencode", "claude", "both"].includes(toolFlag)) fail(`--target no válido: "${toolFlag}".\n${usage}`);
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

// ¿Para qué herramienta instalar? Primero, lo que ya hay en el proyecto; luego, lo instalado.
const onPath = (command) => {
  const exts = process.platform === "win32" ? ["", ".cmd", ".exe", ".ps1", ".bat"] : [""];
  return (process.env.PATH ?? "")
    .split(delimiter)
    .filter(Boolean)
    .some((dir) => exts.some((ext) => existsSync(join(dir, command + ext))));
};
const detectTools = () => {
  const signals = {
    opencode: [".opencode", "opencode.json", "opencode.jsonc"].filter((p) => existsSync(join(target, p))),
    claude: [".claude", "CLAUDE.md"].filter((p) => existsSync(join(target, p))),
  };
  const inProject = Object.keys(signals).filter((tool) => signals[tool].length);
  if (inProject.length) {
    return { tools: inProject, why: inProject.map((tool) => `${tool}: ${signals[tool].join(", ")}`).join(" · ") };
  }
  const installedTools = ["opencode", "claude"].filter(onPath);
  if (installedTools.length) return { tools: installedTools, why: `instalado en el sistema: ${installedTools.join(", ")}` };
  return { tools: ["opencode", "claude"], why: "no detecté ninguna: instalo para las dos" };
};
const detection =
  toolFlag === "auto" ? detectTools() : { tools: toolFlag === "both" ? ["opencode", "claude"] : [toolFlag], why: `--target ${toolFlag}` };
const forOpencode = detection.tools.includes("opencode");
const forClaude = detection.tools.includes("claude");

const kitSkills = join(kitRoot, ".opencode", "skills");
const targetSkills = join(target, ".opencode", "skills");
const claudeSkills = join(target, ".claude", "skills");
const kitPrefix = detectPrefix(kitSkills);
if (!kitPrefix) fail("No encuentro la skill <prefijo>-sdd-bootstrap en el kit.");

const opencodePrefix = detectPrefix(targetSkills);
const claudePrefix = detectPrefix(claudeSkills);
if (opencodePrefix && claudePrefix && opencodePrefix !== claudePrefix) {
  fail(`El proyecto usa prefijos distintos en .opencode ("${opencodePrefix}") y .claude ("${claudePrefix}"). Unifícalos con rename-prefix.mjs.`);
}
const existingPrefix = opencodePrefix ?? claudePrefix;
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
const localCandidates = [join(target, ".opencode", "sdd.local.json"), join(target, ".claude", "sdd.local.json")].filter((p) => existsSync(p));
if (localCandidates.length > 1) fail("Hay sdd.local.json en .opencode y en .claude: deja solo uno (vale para las dos herramientas).");
const localPath = localCandidates[0] ?? join(target, ".opencode", "sdd.local.json");
const localName = relative(target, localPath).split("\\").join("/");
const kitAgents = readdirSync(join(kitRoot, ".opencode", "agents"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.slice(0, -3));
let local = {};
if (existsSync(localPath)) {
  try {
    local = JSON.parse(readFileSync(localPath, "utf8"));
  } catch (error) {
    fail(`No pude leer ${localName}: ${error.message}`);
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
const notes = [];

const writeFile = (path, content, manifest) => {
  const label = relative(target, path);
  manifest?.push(label.split("\\").join("/"));
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

// Fuente común: agentes (con ajustes locales), comandos y skills del kit, ya con el prefijo.
const agents = readdirSync(join(kitRoot, ".opencode", "agents"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => ({ name: name.slice(0, -3), content: applyLocal(name.slice(0, -3), rename(readFileSync(join(kitRoot, ".opencode", "agents", name), "utf8"))) }));
const commandsDir = join(kitRoot, ".opencode", "commands");
const commands = walk(commandsDir).map((file) => ({ name: relative(commandsDir, file), content: rename(readFileSync(file, "utf8")) }));
const kitSkillNames = readdirSync(kitSkills).filter((name) => name.startsWith(from));
const skillFiles = kitSkillNames.flatMap((name) =>
  walk(join(kitSkills, name)).map((file) => ({ file, path: join(name.replace(from, to), relative(join(kitSkills, name), file)) })),
);

const installSkills = (skillsRoot, manifest) => {
  for (const { file, path } of skillFiles) {
    const destination = join(skillsRoot, path);
    if (file.endsWith(".md")) writeFile(destination, rename(readFileSync(file, "utf8")), manifest);
    else {
      manifest.push(relative(target, destination).split("\\").join("/"));
      if (!dryRun) {
        mkdirSync(dirname(destination), { recursive: true });
        cpSync(file, destination);
      }
    }
  }
};

// Borra lo que instaló una versión anterior del kit y ya no existe en esta.
const cleanAndWriteManifest = (manifestPath, installed, removable, skillsRoot) => {
  if (existsSync(manifestPath)) {
    let previous = [];
    try {
      previous = JSON.parse(readFileSync(manifestPath, "utf8")).files ?? [];
    } catch {
      notes.push(`No pude leer ${relative(target, manifestPath)}: no se borra nada.`);
    }
    const keep = new Set(installed);
    for (const file of previous) {
      if (keep.has(file) || !removable.test(file)) continue;
      const path = join(target, file);
      if (!existsSync(path)) continue;
      report.removed.push(file);
      if (dryRun) continue;
      unlinkSync(path);
      const folder = dirname(path);
      if (folder.startsWith(skillsRoot) && folder !== skillsRoot && readdirSync(folder).length === 0) rmdirSync(folder);
    }
  }
  const manifest = `${JSON.stringify({ kit: "SDD-AI-automation", prefix, files: [...installed].sort() }, null, 2)}\n`;
  if (!dryRun) {
    mkdirSync(dirname(manifestPath), { recursive: true });
    writeFileSync(manifestPath, manifest);
  }
};

const foreignSkills = (skillsRoot) => {
  const installedSkills = new Set(kitSkillNames.map((name) => name.replace(from, to)));
  return existsSync(skillsRoot) ? readdirSync(skillsRoot).filter((name) => name.startsWith(to) && !installedSkills.has(name)) : [];
};

// ───────────── OpenCode ─────────────
if (forOpencode) {
  const installed = [];
  for (const { name, content } of agents) writeFile(join(target, ".opencode", "agents", `${name}.md`), content, installed);
  for (const { name, content } of commands) writeFile(join(target, ".opencode", "commands", name), content, installed);
  installSkills(targetSkills, installed);
  cleanAndWriteManifest(join(target, ".opencode", "sdd-kit.json"), installed, /^\.opencode\/(agents|commands|skills)\//, targetSkills);
  const foreign = foreignSkills(targetSkills);
  if (foreign.length) notes.push(`Skills con tu prefijo en .opencode que no vienen del kit (se conservan): ${foreign.join(", ")}`);

  const configPath = join(target, "opencode.json");
  if (existsSync(join(target, "opencode.jsonc")) && !existsSync(configPath)) {
    notes.push('Tu proyecto usa opencode.jsonc: añade a mano "default_agent": "coordinator" (no lo edito para no perder tus comentarios).');
  } else if (!existsSync(configPath)) {
    writeFile(configPath, readFileSync(join(kitRoot, "opencode.json"), "utf8"));
  } else {
    try {
      const config = JSON.parse(readFileSync(configPath, "utf8"));
      if (config.default_agent === "coordinator") report.unchanged.push("opencode.json");
      else if (config.default_agent) notes.push(`opencode.json tiene default_agent "${config.default_agent}": revisa si quieres "coordinator".`);
      else writeFile(configPath, `${JSON.stringify({ ...config, default_agent: "coordinator" }, null, 2)}\n`);
    } catch {
      notes.push('No pude leer opencode.json (¿tiene comentarios?): añade a mano "default_agent": "coordinator".');
    }
  }
}

// ───────────── Claude Code ─────────────
if (forClaude) {
  const claudeDir = join(target, ".claude");
  const installed = [];
  const permissions = {};
  for (const { name, content } of agents) {
    const converted = convertAgent(name, content);
    permissions[name] = converted.permission;
    writeFile(join(claudeDir, "agents", `${name}.md`), converted.content, installed);
  }
  for (const { name, content } of commands) writeFile(join(claudeDir, "commands", name), convertCommand(content), installed);
  installSkills(claudeSkills, installed);
  writeFile(
    join(claudeDir, "sdd-permissions.json"),
    `${JSON.stringify({ $comment: "Generado por el kit SDD desde .opencode/agents (+ sdd.local.json). No lo edites: vuelve a ejecutar el instalador.", agents: permissions }, null, 2)}\n`,
    installed,
  );
  writeFile(join(claudeDir, "hooks", "sdd-guard.mjs"), readFileSync(join(kitRoot, "claude", "hooks", "sdd-guard.mjs"), "utf8"), installed);
  cleanAndWriteManifest(
    join(claudeDir, "sdd-kit.json"),
    installed,
    /^\.claude\/((agents|commands|skills|hooks)\/|sdd-permissions\.json$)/,
    claudeSkills,
  );
  const foreign = foreignSkills(claudeSkills);
  if (foreign.length) notes.push(`Skills con tu prefijo en .claude que no vienen del kit (se conservan): ${foreign.join(", ")}`);

  // settings.json: agente principal = coordinator y el hook guardián (sin tocar lo demás).
  const settingsPath = join(claudeDir, "settings.json");
  let settings = {};
  let settingsOk = true;
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    } catch {
      settingsOk = false;
      notes.push('No pude leer .claude/settings.json (¿tiene comentarios?): añade a mano "agent": "coordinator" y el hook de claude/settings.example.json del kit.');
    }
  }
  if (settingsOk) {
    const merged = mergeSettings(settings);
    notes.push(...merged.notes);
    writeFile(settingsPath, `${JSON.stringify(merged.settings, null, 2)}\n`);
  }

  // CLAUDE.md: Claude Code no lee AGENTS.md por sí solo; lo importa.
  const claudeMd = join(target, "CLAUDE.md");
  if (!existsSync(claudeMd)) writeFile(claudeMd, readFileSync(join(kitRoot, "claude", "CLAUDE.md"), "utf8"));
  else if (!readFileSync(claudeMd, "utf8").includes("@AGENTS.md")) notes.push("Tu CLAUDE.md no importa AGENTS.md: añade una línea con @AGENTS.md (no lo edito).");
}

// ───────────── Informe ─────────────
const toolNames = { opencode: "OpenCode", claude: "Claude Code" };
console.log(`${dryRun ? "[simulación] " : ""}Kit SDD → ${target} (prefijo ${to}*)`);
console.log(`Herramientas: ${detection.tools.map((t) => toolNames[t]).join(" + ")} (${detection.why})`);
for (const [title, files] of [["Nuevos", report.created], ["Actualizados", report.updated], ["Eliminados (ya no están en el kit)", report.removed]]) {
  if (files.length) console.log(`\n${title} (${files.length}):\n${files.map((f) => `  ${f}`).join("\n")}`);
}
console.log(`\nSin cambios: ${report.unchanged.length} archivos.`);
const localRules = Object.entries(local).filter(([agent]) => !agent.startsWith("$"));
if (localRules.length) {
  console.log(`\nAjustes de ${localName} aplicados (al final de cada permiso):`);
  for (const [agent, perms] of localRules) {
    for (const [perm, rules] of Object.entries(perms)) {
      for (const [pattern, action] of Object.entries(rules)) console.log(`  ${agent}.${perm}: "${pattern}": ${action}`);
    }
  }
}
for (const note of notes) console.log(`\n⚠️  ${note}`);
if (!dryRun && (report.created.length || report.updated.length || report.removed.length)) {
  console.log(`\nReinicia ${detection.tools.map((t) => toolNames[t]).join(" y ")} para que cargue los cambios.`);
}
if (forOpencode && forClaude) {
  console.log("\nNota: OpenCode también puede leer .claude/skills. Son las mismas skills, así que no estorban.");
}
