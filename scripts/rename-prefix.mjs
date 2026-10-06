#!/usr/bin/env node
// Renombra el prefijo de las skills del kit SDD (ej. cuco-sdd-* → gym-sdd-*).
// Uso: node scripts/rename-prefix.mjs <nuevo> [actual]
//   node scripts/rename-prefix.mjs gym          → cuco-sdd-* pasa a gym-sdd-*
//   node scripts/rename-prefix.mjs shop gym     → gym-sdd-*  pasa a shop-sdd-*
// Renombra las carpetas de .opencode/skills y reemplaza el prefijo en todos los archivos
// de .opencode/ y en AGENTS.md (si existe). Los nombres de skill deben coincidir con su
// carpeta, y los permisos `skill` de los agentes los listan por nombre: por eso se cambia
// todo de una vez.
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [next, current = "cuco"] = process.argv.slice(2);
const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/;

if (!next || !valid.test(next) || !valid.test(current)) {
  console.error("Uso: node scripts/rename-prefix.mjs <nuevo> [actual]  (minúsculas, números y guiones)");
  process.exit(1);
}
if (next === current) {
  console.error(`El prefijo ya es "${current}".`);
  process.exit(1);
}

const from = `${current}-sdd-`;
const to = `${next}-sdd-`;
const skillsDir = join(".opencode", "skills");

if (!existsSync(skillsDir)) {
  console.error("No encuentro .opencode/skills: ejecuta el script desde la raíz del proyecto.");
  process.exit(1);
}

const folders = readdirSync(skillsDir).filter((name) => name.startsWith(from));
if (folders.length === 0) {
  console.error(`No hay skills con el prefijo "${from}" en ${skillsDir}.`);
  process.exit(1);
}

const clash = folders.map((name) => name.replace(from, to)).find((name) => existsSync(join(skillsDir, name)));
if (clash) {
  console.error(`Ya existe ${join(skillsDir, clash)}: no se renombra nada.`);
  process.exit(1);
}

for (const name of folders) renameSync(join(skillsDir, name), join(skillsDir, name.replace(from, to)));

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (name === "node_modules") return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const files = [...walk(".opencode"), ...(existsSync("AGENTS.md") ? ["AGENTS.md"] : [])].filter((f) => f.endsWith(".md"));
let changed = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(from)) continue;
  writeFileSync(file, text.split(from).join(to));
  changed++;
}

console.log(`${folders.length} skills renombradas y ${changed} archivos actualizados: ${from}* → ${to}*`);
console.log("Reinicia OpenCode para que cargue los nuevos nombres.");
