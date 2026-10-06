#!/usr/bin/env node
// Instala o actualiza el kit SDD en un proyecto: copia agentes, comandos y skills del kit a
// <proyecto>/.opencode/ respetando el prefijo de skills que ya use el proyecto.
// Uso: node scripts/install.mjs <ruta-del-proyecto> [--prefix <prefijo>] [--dry-run]
//   --prefix   prefijo para un proyecto nuevo (ej. gym → gym-sdd-*). Por defecto, el que ya
//              tenga el proyecto o, si no tiene, el del kit.
//   --dry-run  muestra qué haría sin escribir nada.
// Nunca toca AGENTS.md, MEMORY.md, docs/ ni specs/: eso es del proyecto, no del kit.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
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

const report = { created: [], updated: [], unchanged: [] };

const writeFile = (path, content) => {
  const label = relative(target, path);
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
    writeFile(join(target, ".opencode", folder, relative(source, file)), rename(readFileSync(file, "utf8")));
  }
}

const kitSkillNames = readdirSync(kitSkills).filter((name) => name.startsWith(from));
for (const name of kitSkillNames) {
  const source = join(kitSkills, name);
  for (const file of walk(source)) {
    const destination = join(targetSkills, name.replace(from, to), relative(source, file));
    if (file.endsWith(".md")) writeFile(destination, rename(readFileSync(file, "utf8")));
    else if (!dryRun) cpSync(file, destination);
  }
}

const installed = new Set(kitSkillNames.map((name) => name.replace(from, to)));
const foreign = existsSync(targetSkills)
  ? readdirSync(targetSkills).filter((name) => name.startsWith(to) && !installed.has(name))
  : [];

const configPath = join(target, "opencode.json");
let configNote = "";
if (!existsSync(configPath)) {
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
for (const [title, files] of [["Nuevos", report.created], ["Actualizados", report.updated]]) {
  if (files.length) console.log(`\n${title} (${files.length}):\n${files.map((f) => `  ${f}`).join("\n")}`);
}
console.log(`\nSin cambios: ${report.unchanged.length} archivos.`);
if (foreign.length) console.log(`\nSkills con tu prefijo que no vienen del kit (se conservan): ${foreign.join(", ")}`);
if (configNote) console.log(`\n⚠️  ${configNote}`);
if (!dryRun && (report.created.length || report.updated.length)) console.log("\nReinicia OpenCode para que cargue los cambios.");
