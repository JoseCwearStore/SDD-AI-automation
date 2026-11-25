// Lee el frontmatter de los agentes y comandos del kit (formato OpenCode) sin dependencias.
// Solo entiende el subconjunto que usa el kit: claves de primer nivel con valor escalar y el
// bloque `permission:` (permiso → escalar, o permiso → lista "patrón": acción).

const unquote = (value) => {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
};

// Separa "clave: valor" respetando claves entre comillas que contienen ":".
const splitKey = (text) => {
  const t = text.trim();
  if (t.startsWith('"')) {
    const end = t.indexOf('"', 1);
    return [t.slice(1, end), t.slice(end + 1).replace(/^\s*:/, "").trim()];
  }
  const at = t.indexOf(":");
  return [t.slice(0, at).trim(), t.slice(at + 1).trim()];
};

export const parseFrontmatter = (text) => {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") return { data: {}, body: text };
  const close = lines.indexOf("---", 1);
  if (close < 0) return { data: {}, body: text };
  const data = {};
  let inPermission = false;
  let current;
  for (const raw of lines.slice(1, close)) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    if (indent === 0) {
      const [key, value] = splitKey(raw);
      inPermission = key === "permission";
      if (inPermission) data.permission = {};
      else data[key] = unquote(value);
      continue;
    }
    if (!inPermission) continue;
    if (indent === 2) {
      const [perm, value] = splitKey(raw);
      current = data.permission[perm] = [];
      if (value) current.push(["*", unquote(value)]);
      continue;
    }
    const [pattern, action] = splitKey(raw);
    current?.push([pattern, unquote(action)]);
  }
  return { data, body: lines.slice(close + 1).join("\n") };
};
