// Convierte los agentes y comandos del kit (formato OpenCode) al formato de Claude Code.
// - Agentes → .claude/agents/<nombre>.md (name, description, disallowedTools + mismo cuerpo).
// - Permisos finos (rutas, comandos, skills, subagentes) → .claude/sdd-permissions.json, que
//   aplica el hook .claude/hooks/sdd-guard.mjs con la misma regla que OpenCode: gana la
//   ÚLTIMA regla que coincide.
// - Comandos → .claude/commands/<nombre>.md (sin `agent:`: el coordinador es el agente
//   principal por `"agent": "coordinator"` en .claude/settings.json).
import { parseFrontmatter } from "./frontmatter.mjs";

// Herramientas de Claude Code que se quitan del todo cuando un permiso es "deny" sin excepciones.
const TOOLS = {
  edit: ["Edit", "Write", "NotebookEdit"],
  bash: ["Bash"],
  webfetch: ["WebFetch"],
  websearch: ["WebSearch"],
  task: ["Agent"],
};

const fullyDenied = (rules) => rules.length > 0 && rules.every(([, action]) => action === "deny");

const yamlString = (text) => JSON.stringify(text);

export const convertAgent = (name, text) => {
  const { data, body } = parseFrontmatter(text);
  const permission = data.permission ?? {};
  const disallowed = Object.entries(TOOLS).flatMap(([perm, tools]) =>
    permission[perm] && fullyDenied(permission[perm]) ? tools : [],
  );
  const front = [
    "---",
    `name: ${name}`,
    `description: ${yamlString(data.description ?? name)}`,
    ...(disallowed.length ? [`disallowedTools: ${disallowed.join(", ")}`] : []),
    "# Generado por el kit SDD desde .opencode/agents. Los permisos finos están en",
    "# .claude/sdd-permissions.json y los aplica .claude/hooks/sdd-guard.mjs.",
    "---",
  ];
  return { content: `${front.join("\n")}\n${body.replace(/^\n+/, "\n")}`, permission };
};

export const convertCommand = (text) => {
  const { data, body } = parseFrontmatter(text);
  const usage = data.description?.match(/\(uso - \/\S+\s*(.*)\)\s*$/);
  const front = ["---", `description: ${yamlString(data.description ?? "")}`];
  if (usage?.[1]) front.push(`argument-hint: ${yamlString(usage[1])}`);
  front.push("---");
  return `${front.join("\n")}\n${body.replace(/^\n+/, "")}`;
};

export const HOOK_MATCHER = "Read|Grep|Edit|Write|MultiEdit|NotebookEdit|Bash|PowerShell|WebFetch|WebSearch|Agent|Task|Skill";
export const HOOK_SCRIPT = "sdd-guard.mjs";

export const hookEntry = () => ({
  matcher: HOOK_MATCHER,
  hooks: [
    {
      type: "command",
      command: "node",
      args: ["${CLAUDE_PROJECT_DIR}/.claude/hooks/sdd-guard.mjs"],
      timeout: 15,
      onFailure: "block",
    },
  ],
});

// Añade el agente por defecto y el hook a un settings.json existente (o nuevo) sin tocar lo demás.
export const mergeSettings = (settings) => {
  const notes = [];
  const next = { ...settings };
  if (!next.agent) next.agent = "coordinator";
  else if (next.agent !== "coordinator") notes.push(`.claude/settings.json tiene "agent": "${next.agent}": revisa si quieres "coordinator".`);
  const hooks = { ...(next.hooks ?? {}) };
  const pre = [...(hooks.PreToolUse ?? [])];
  const present = pre.some((entry) => JSON.stringify(entry).includes(HOOK_SCRIPT));
  if (!present) pre.push(hookEntry());
  hooks.PreToolUse = pre;
  next.hooks = hooks;
  return { settings: next, notes };
};
