#!/usr/bin/env node
// Kit SDD · Guardián de permisos para Claude Code (hook PreToolUse).
// Aplica a cada agente del kit los mismos permisos que tiene en OpenCode, guardados en
// .claude/sdd-permissions.json: gana la ÚLTIMA regla que coincide; `*` es cualquier texto y
// `?` un carácter. Fuera de los agentes del kit, o fuera del proyecto, no decide nada.
// Si algo falla (JSON roto, archivo ausente), bloquea: mejor parar que saltarse un permiso.
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const block = (reason) => {
  process.stderr.write(`Kit SDD: ${reason}\n`);
  process.exit(2);
};

const decide = (decision, reason) => {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: decision, permissionDecisionReason: reason } }),
  );
  process.exit(0);
};

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch (error) {
  block(`no pude leer la entrada del hook (${error.message}).`);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let config;
try {
  config = JSON.parse(readFileSync(join(projectDir, ".claude", "sdd-permissions.json"), "utf8"));
} catch (error) {
  block(`no pude leer .claude/sdd-permissions.json (${error.message}). Vuelve a ejecutar el instalador del kit.`);
}

const agent = input.agent_type;
const rules = agent ? config.agents?.[agent] : undefined;
if (!rules) process.exit(0); // sesión normal o agente ajeno al kit: flujo de permisos habitual

const windows = process.platform === "win32";
const toRegex = (pattern) =>
  new RegExp(
    `^${pattern
      .split("")
      .map((c) => (c === "*" ? ".*" : c === "?" ? "." : c.replace(/[.+^${}()|[\]\\]/g, "\\$&")))
      .join("")}$`,
    windows ? "si" : "s",
  );

// Gana la última regla que coincide; sin coincidencia → undefined (no decide).
const evaluate = (perm, subject) => {
  let result;
  for (const [pattern, action] of rules[perm] ?? []) if (toRegex(pattern).test(subject)) result = action;
  return result;
};

const RANK = { deny: 3, ask: 2, undefined: 1, allow: 0 };
const strictest = (actions) => actions.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), "allow");

// Ruta relativa al proyecto con "/"; undefined si está fuera (lo decide el flujo normal).
const projectPath = (path) => {
  if (!path) return undefined;
  const absolute = isAbsolute(path) ? path : resolve(input.cwd || projectDir, path);
  const rel = relative(projectDir, absolute);
  if (rel.startsWith("..") || isAbsolute(rel)) return undefined;
  return rel.split("\\").join("/") || ".";
};

// Divide un comando en subcomandos (&&, ||, ;, |, saltos de línea) como hace OpenCode.
const commands = (text) =>
  text
    .split(/&&|\|\||[;|\n]/)
    .map((part) => part.trim())
    .filter(Boolean);

// ¿Escribe un archivo desde la terminal? (>, >>, Out-File, Set-Content, tee). Los permisos de
// edición protegen rutas y escribir por la terminal se los salta: siempre lo aprueba el usuario.
const writesFile = (text) => {
  const bare = text
    .replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, "''")
    .replace(/\d*>&\d/g, "")
    .replace(/\d*>>?\s*(\/dev\/null|\$null|nul)(?=\s|$)/gi, "");
  return /\d*>>?/.test(bare) || /(^|[\s|;&(])(tee|Out-File|Set-Content|Add-Content)(?=\s|$)/i.test(bare);
};

const SECRET = /(^|[\s'"=/\\])(\.env(?!\.example\b)(\.[\w.-]+)?|\.envrc|[\w.-]+\.(pem|key)|id_rsa\w*|id_ed25519\w*)(?=$|[\s'"])/;

const tool = input.tool_name;
const ti = input.tool_input ?? {};
const label = `${agent}`;
let perm;
let action;
let subject;

switch (tool) {
  case "Read":
  case "Grep": {
    perm = "read";
    const targets = [ti.file_path, ti.path].map(projectPath).filter(Boolean);
    if (ti.glob) targets.push(String(ti.glob));
    if (!targets.length) process.exit(0);
    subject = targets.join(", ");
    action = strictest(targets.map((t) => evaluate(perm, t)));
    break;
  }
  case "Edit":
  case "Write":
  case "MultiEdit":
  case "NotebookEdit": {
    perm = "edit";
    subject = projectPath(ti.file_path ?? ti.notebook_path);
    if (!subject) process.exit(0);
    action = evaluate(perm, subject);
    break;
  }
  case "Bash":
  case "PowerShell": {
    perm = "bash";
    subject = String(ti.command ?? "");
    const parts = commands(subject);
    action = strictest(parts.length ? parts.map((c) => evaluate(perm, c)) : [evaluate(perm, subject)]);
    if (action !== "deny" && writesFile(subject)) {
      decide("ask", `Kit SDD (${label}): el comando escribe un archivo desde la terminal (los archivos se editan con la herramienta de edición).`);
    }
    // Un comando que nombra un secreto lo debe aprobar el usuario (la terminal no se bloquea por ruta).
    if (action !== "deny" && rules.read && SECRET.test(subject)) {
      decide("ask", `Kit SDD (${label}): el comando menciona un archivo de secretos (.env, clave…). Apruébalo solo si no lo lee.`);
    }
    break;
  }
  case "WebFetch":
    perm = "webfetch";
    subject = String(ti.url ?? "");
    action = evaluate(perm, subject);
    break;
  case "WebSearch":
    perm = "websearch";
    subject = String(ti.query ?? "");
    action = evaluate(perm, subject);
    break;
  case "Agent":
  case "Task":
    perm = "task";
    subject = String(ti.subagent_type ?? "general-purpose");
    action = evaluate(perm, subject);
    break;
  case "Skill":
    perm = "skill";
    subject = String(ti.skill ?? ti.command ?? ti.name ?? "").replace(/^\//, "").split(":").pop();
    action = evaluate(perm, subject);
    break;
  default:
    process.exit(0);
}

if (action === undefined || action === "undefined") process.exit(0);
const reason = `Kit SDD (${label}): permiso ${perm} → ${action} para ${subject}`;
if (action === "deny") decide("deny", `${reason}. Esta acción no es de este agente: devuélvelo en "Dudas o decisiones".`);
decide(action, reason);
