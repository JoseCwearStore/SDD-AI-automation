# SDD AI Automation — kit de Spec-Driven Development para OpenCode

Un equipo de agentes de IA que lleva un proyecto **desde la idea hasta el código revisado**,
con especificaciones primero, TDD y aprobación humana en cada paso.

- Arranca un proyecto **de cero** (o se adapta a uno existente) y genera sus archivos de
  gobierno: `AGENTS.md`, `MEMORY.md` y `docs/constitution.md`.
- **Arquitectura hexagonal por defecto** en backend y frontend. Te lo avisa y la cambia
  solo si se lo pides (MVC, capas…).
- Decide el camino: **SDD completo** para funcionalidades nuevas, o el flujo liviano
  `/sdd-feature` para cambios pequeños.
- **Seguridad integrada**: 10 controles (rate limiting, secretos, RLS, validación, auth,
  errores, logs…) que se previenen desde la spec y se auditan como **última fase**. Si algo
  falla, vuelve al agente responsable para corregirlo.
- **Portable**: no depende del stack (Node, Python, Go, Java, .NET…) ni de servicios externos.
- **Transparente**: anuncia quién hace qué y te pregunta si revisaste lo generado antes de
  aprobar nada.

> La IA ejecuta, tú diriges. Ningún paso importante se aprueba sin tu "sí".

---

## Requisitos

- [OpenCode](https://opencode.ai) (probado contra el schema de la versión 1.18).
- Un modelo que soporte **subagentes**. Los modelos gratuitos de OpenCode fallan al invocarlos:
  usa un proveedor propio con API key.
- `git` en el proyecto (el reviewer revisa el diff).
- Node.js, para los scripts de instalación y de renombrado.

## Instalación

Clona este repositorio en cualquier carpeta y, desde ella, instala el kit en tu proyecto:

```bash
node scripts/install.mjs ../mi-proyecto --prefix gym
```

- `--prefix gym` deja las skills como `gym-sdd-*` ([por qué](#personalizar-el-prefijo-de-las-skills)).
  Si no lo indicas, se usa el del kit (`cuco`).
- `--dry-run` muestra qué haría sin escribir nada.
- Copia `.opencode/agents`, `.opencode/commands` y `.opencode/skills`, y crea o completa
  `opencode.json` con `"default_agent": "coordinator"`.
- **Nunca toca** `AGENTS.md`, `MEMORY.md`, `docs/` ni `specs/`: son de tu proyecto.
- No borra nada: si tienes skills propias con tu prefijo, se conservan.

Después:
1. Reinicia OpenCode y comprueba que aparecen los agentes al escribir `@`
   (`coordinator`, `planner`, `tester`, `implementer`, `reviewer`).
2. Ejecuta `/sdd-bootstrap <tu idea>`.

### Actualizar el kit en un proyecto

Haz `git pull` en el kit y vuelve a ejecutar el mismo comando, sin `--prefix`: detecta el
prefijo que ya usa tu proyecto y solo reescribe los archivos que cambiaron. Con el kit
como única fuente de verdad, todos tus proyectos se actualizan igual.

### Sin Node

Copia a mano la carpeta `.opencode/` y `opencode.json` en la raíz de tu proyecto (si ya
tienes un `opencode.json`, añade solo `"default_agent": "coordinator"`).

## Personalizar el prefijo de las skills

Las skills se llaman `cuco-sdd-<fase>` (`cuco-sdd-feature`, `cuco-sdd-spec`…). **`cuco` es
solo el prefijo del proyecto** donde nació el kit: puedes, y conviene, renombrarlo al de tu
proyecto. Por ejemplo, en un proyecto de gimnasio:

| Antes | Después |
|-------|---------|
| `cuco-sdd-feature` | `gym-sdd-feature` |
| `cuco-sdd-spec` | `gym-sdd-spec` |
| `cuco-sdd-bootstrap` | `gym-sdd-bootstrap` |

¿Por qué renombrarlo?
- Identificas de un vistazo qué skills son del flujo de ESE proyecto.
- Evitas choques si tienes otras skills globales con nombres parecidos (`sdd-*`, de otros
  kits) o varios proyectos con su propio flujo.

### Con el script (recomendado)

En un proyecto nuevo, lo más simple es el `--prefix` de la instalación. Para renombrar uno
ya instalado, desde la raíz de ese proyecto:

```bash
node <ruta-del-kit>/scripts/rename-prefix.mjs gym
```

Si ya lo habías renombrado antes, indica el prefijo actual como segundo argumento:

```bash
node <ruta-del-kit>/scripts/rename-prefix.mjs shop gym
```

El script renombra las 13 carpetas de `.opencode/skills/` y reemplaza el prefijo en todos los
archivos de `.opencode/` y en `AGENTS.md`. Después, **reinicia OpenCode**.

### A mano

El renombrado tiene que ser **completo**. Si queda a medias, los agentes no encuentran sus
skills y devuelven BLOQUEADO. Tienes que cambiar:
1. El nombre de cada carpeta `.opencode/skills/cuco-sdd-*/`.
2. El campo `name:` del frontmatter de cada `SKILL.md`: debe coincidir EXACTAMENTE con su
   carpeta.
3. Cada mención en `.opencode/agents/*.md`, sobre todo en los permisos `skill:` (los listan
   por nombre).
4. Las menciones en `.opencode/commands/*.md`, en el resto de skills y en `AGENTS.md` (si
   ya existe).

> Los **comandos** (`/sdd`, `/sdd-feature`…) no llevan prefijo y no cambian.

---

## Comandos

| Comando | Para qué |
|---------|----------|
| `/sdd-bootstrap <idea>` | Prepara el proyecto: entrevista, visión, roadmap, `AGENTS.md`, `MEMORY.md` y constitución. |
| `/sdd <petición>` | Flujo completo: spec → plan → tests → código → revisión → seguridad. Si el cambio es pequeño, te recomienda `/sdd-feature`. |
| `/sdd-continue <NNN> [indicaciones]` | Retoma una spec existente desde la fase en que quedó (la detecta solo). Nunca crea una spec nueva. |
| `/sdd-feature <petición>` | Cambio pequeño sin spec: mini plan → TDD → revisión → seguridad. |
| `/sdd-change <NNN-spec> <cambio>` | Cambia los requisitos de una spec existente, con análisis de impacto. |
| `/sdd-constitution [contexto]` | Crea (si no existe) o revisa `docs/constitution.md`. |
| `/sdd-status [NNN-spec]` | En qué fase está cada spec y cuál es el siguiente paso exacto. |

### ¿`/sdd` o `/sdd-feature`?

Un cambio es **pequeño** solo si cumple TODO:
- toca un único módulo,
- no cambia reglas de dominio,
- no toca el esquema de datos ni las migraciones,
- no añade dependencias,
- no añade ni cambia contratos del borde (API, CLI, eventos),
- no toca autenticación, autorización, secretos ni datos sensibles.

Si cumple todo → `/sdd-feature`. Si falla uno solo → `/sdd`. Aunque lances `/sdd`, el
coordinador hace esta triage primero y te recomienda el camino.

## Cómo funciona

### 1. Bootstrap (`/sdd-bootstrap`)

1. **Inventario**: comprueba qué existe. Lo que falta **se genera de cero**; lo que ya existe
   **nunca se pisa**: se propone un diff y solo se aplica con tu aprobación.
2. **Arquitectura**: te avisa de que usará **hexagonal en back y front** salvo que pidas otra.
3. **Entrevista por etapas** (producto → dominio → no funcionales → técnica → roadmap): en
   cada decisión técnica te propone opciones con ventajas y desventajas y recomienda una.
4. **Genera** `specs/000-vision/vision.md`, `specs/000-vision/roadmap.md`, `AGENTS.md`,
   `MEMORY.md` y `docs/constitution.md`, y te pide revisar cada uno.
5. **Cierre**: te explica cuándo usar `/sdd` y cuándo `/sdd-feature`.

Detecta solo si el proyecto es **greenfield** (sin código) o **brownfield** (con código). En
brownfield describe lo que HAY, sin inventar.

### 2. Flujo completo (`/sdd`)

| Fase | Quién | Resultado |
|------|-------|-----------|
| 0. Triage | coordinator | ¿flujo completo o `/sdd-feature`? |
| 1. Spec | planner | `specs/NNN-nombre/spec.md` (requisitos EARS + criterios Dado/Cuando/Entonces) |
| 2. Revisión de spec | reviewer | ambigüedades, contradicciones, casos límite → 🔎 tu aprobación |
| 3. Plan y tareas | planner | `plan.md` y `tasks.md` (máx. 10 tareas) → 🔎 tu aprobación |
| 4. Tests de aceptación | tester | un test por criterio, en rojo por la razón correcta |
| 5. Implementación | implementer | UNA tarea por delegación, con TDD |
| 6. Revisión de código | reviewer | `review.md`: RF por RF, constitución, arquitectura y alcance |
| 7. Correcciones | responsable de cada hallazgo | máximo 2 vueltas |
| 8. 🔒 Seguridad | reviewer | `security.md`: controles C1–C10. Si falla, cada hallazgo vuelve a su responsable (máx. 2 vueltas) |
| 9. Cierre | implementer + coordinator | `MEMORY.md` actualizado, 🔎 del diff y mensaje de commit propuesto |

El commit lo haces **tú**.

### 3. Seguridad

La skill `cuco-sdd-security` define 10 controles y trabaja en dos modos:

| # | Control | Qué exige |
|---|---------|-----------|
| C1 | Rate limiting | Límite en endpoints públicos y de auth; 429 al superarlo |
| C2 | Secretos solo en el servidor | Nada de secretos en el cliente ni en variables expuestas al bundle (`VITE_*`, `NEXT_PUBLIC_*`…) |
| C3 | RLS en todas las tablas | Si es PostgreSQL/Supabase: ENABLE + **FORCE** RLS y políticas en cada migración |
| C4 | `.env` fuera de git | `.env*` ignorado (salvo `.env.example` con valores ficticios), sin secretos en el diff |
| C5 | Validación de entradas | Esquema en el borde, 400 sin eco del dato, consultas parametrizadas, nada de HTML sin escapar |
| C6 | Ninguna tabla pública | Rol de mínimo privilegio, sin `GRANT` a `PUBLIC`, base no expuesta a internet |
| C7 | Auth en rutas protegidas | Denegar por defecto; 401 / 403; nada de acceso a recursos ajenos cambiando el id |
| C8 | Errores sin stack traces | Manejador único; al cliente, mensaje genérico e id de correlación |
| C9 | Debug/admin bloqueados | Sin rutas de debug en producción; admin con rol explícito |
| C10 | Logging de seguridad | Logins, 401/403/429 y acciones admin registrados, sin secretos ni datos personales |

- **Modo GUÍA (prevenir)**: la spec declara quién puede hacer qué (con RF de rechazo
  testeables), el plan recorre C1–C10 y lista las rutas públicas, el tester escribe los
  tests 401/403/429 y el implementer codifica siguiendo esa sección.
- **Modo AUDITORÍA (última fase)**: el reviewer comprueba cada control (CUMPLE / NO CUMPLE
  / NO APLICA / MANUAL) y escribe `security.md`. Si algo no cumple, el coordinador manda
  cada hallazgo a su responsable y vuelve a auditar. Lo que no se puede comprobar
  automáticamente (ej. el historial completo de git o la configuración de producción) te lo
  lista con los pasos exactos.

Lo concreto de tu stack (qué limitador, qué logger, qué límites) va en la sección
**"Seguridad"** de `AGENTS.md`, que genera el bootstrap.

### Transparencia

Durante todo el flujo, el coordinador:
- anuncia cada delegación: `▶ Fase · @agente · skill · qué va a hacer`,
- informa al terminar: `✔ @agente · Estado · archivos creados / modificados`,
- en cada punto de revisión 🔎 te da las rutas y pregunta **"¿Ya revisaste…?"**. Sin tu "sí"
  no hay aprobación.

## Agentes y permisos

| Agente | Rol | Puede escribir |
|--------|-----|----------------|
| `coordinator` | Dirige el flujo y es el único que habla contigo | Nada |
| `planner` | Visión, specs, plan, tareas y archivos de gobierno | `specs/**/*.md`, `AGENTS.md`, `MEMORY.md`, `docs/constitution.md` |
| `tester` | Tests de aceptación | Solo carpetas `acceptance/` |
| `implementer` | Código con TDD | Todo, salvo `.opencode/`, `AGENTS.md`, la constitución, las specs (excepto marcar `tasks.md`), `acceptance/` y los `.env`. **Pide permiso** para manifiestos de dependencias, esquema, migraciones y Docker |
| `reviewer` | Revisa la spec, el código y la seguridad | Solo `specs/**/review.md` y `specs/**/security.md` |

Ningún agente puede **leer** los `.env` (salvo `.env.example`), así un secreto nunca termina
en el chat. Ningún agente puede hacer `git commit`, `git push` ni borrados recursivos. Los comandos de
tests, tipos y lint de los stacks más comunes están permitidos; el resto pide confirmación.

## Convenciones del kit

- **Tests de aceptación** siempre en carpetas llamadas `acceptance/` (los permisos del tester
  dependen de ello) y nombrados `NNN-RFn: <qué comprueba>` (ej. `004-RF3: rechaza solicitud a
  uno mismo`). El prefijo de spec evita choques entre specs.
- **Constitución**: cada principio se verifica con `Verificar [auto]` (lo comprueba el
  reviewer) y/o `Verificar [manual]` (te lo lista a ti: el reviewer nunca lo da por hecho).
- **Specs**: `specs/NNN-nombre/` con `spec.md`, `plan.md`, `tasks.md`, `review.md` y
  `security.md`.
- **Skills = CÓMO · AGENTS.md y constitución = QUÉ · agentes = QUIÉN.** Las skills no nombran
  módulos ni comandos concretos: los leen de `AGENTS.md`.

## Estructura del repositorio

```
.opencode/
├── agents/      coordinator, planner, tester, implementer, reviewer
├── commands/    sdd, sdd-continue, sdd-feature, sdd-change, sdd-bootstrap, sdd-constitution, sdd-status
└── skills/      cuco-sdd-<fase>/SKILL.md (13 skills: una por fase + seguridad)
opencode.json    default_agent: coordinator
scripts/
├── install.mjs        instala o actualiza el kit en un proyecto
└── rename-prefix.mjs  cambia el prefijo de las skills
```

## Problemas conocidos de OpenCode (aprendidos a la mala)

- La clave es `permission` (singular). `permissions` se ignora **en silencio**.
- En los permisos gana la **última** regla que coincide: lo general primero, lo específico al
  final.
- Patrones de `edit` en Windows: empieza con `*` y usa `?` como separador de carpetas
  (`"*specs?*.md"`). `"specs/**"` no coincide.
- **Nunca pongas `?` justo después del `*` inicial** (`"*?specs?*"`): exige un carácter
  antes de la carpeta y falla cuando OpenCode compara la ruta relativa (`specs\…`). Un
  `allow` así bloquea a un agente, y un `deny` así deja la puerta abierta.
- Un YAML inválido en el frontmatter de un agente hace que OpenCode lo **descarte en
  silencio**. Si un agente no aparece con `@`, revisa su YAML.
- Si un subagente falla y estás en el agente Build, Build hace el trabajo él mismo **sin
  restricciones**. Por eso `default_agent` es `coordinator`.
- Un `@agente` escrito por el usuario se salta el permiso `task` del agente primario.
- Un permiso que no probaste no está verificado: después de instalar, prueba con cada agente
  un caso **permitido** y uno **denegado**.

## Licencia

[MIT](LICENSE): úsalo, modifícalo y compártelo libremente, manteniendo el aviso de copyright.
