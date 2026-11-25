# SDD AI Automation — kit de Spec-Driven Development para OpenCode y Claude Code

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
- **Cumplimiento**: privacidad (P1–P12) y accesibilidad WCAG 2.2 AA (A1–A8) en cada spec, y
  un `/sdd-release` que genera **borradores** legales desde el código y te dice qué es 100%
  tuyo (revisión legal, datos de la empresa, edad mínima…).
- **Diseño consistente**: un sistema de diseño mínimo (paleta con contraste verificado y
  tipografía) antes de la primera pantalla, creado desde cero o desde tus referencias
  (Figma exportado, plantillas, capturas, manual de marca).
- **Portable**: no depende del stack (Node, Python, Go, Java, .NET…) ni de servicios externos.
- **Transparente**: anuncia quién hace qué y te pregunta si revisaste lo generado antes de
  aprobar nada.

> La IA ejecuta, tú diriges. Ningún paso importante se aprueba sin tu "sí".

---

## Requisitos

- [OpenCode](https://opencode.ai) (probado contra el schema de la versión 1.18) **o**
  [Claude Code](https://code.claude.com) v2.1.295 o posterior (ver [Claude Code](#claude-code)).
  Puedes usar los dos en el mismo proyecto.
- Un modelo que soporte **subagentes**. En OpenCode, los modelos gratuitos fallan al invocarlos:
  usa un proveedor propio con API key. En Claude Code usas tu cuenta de Claude (plan Pro, Max,
  Team o Enterprise), sin API key.
- `git` en el proyecto (el reviewer revisa el diff).
- Node.js, para los scripts de instalación y de renombrado.

## Instalación

Los comandos del kit (`git`, `node scripts/…`) son iguales en Windows, macOS y Linux. Lo que
cambia por sistema es cómo instalar los requisitos.

### 1. Requisitos según tu sistema

Recomendamos **fnm** para Node.js: cada proyecto puede exigir su propia versión (en su
`.nvmrc`) y fnm cambia de versión solo al entrar en la carpeta, sin afectar a tus otros
proyectos.

Instala **OpenCode, Claude Code o los dos**: en cada sistema verás las dos opciones.

**Windows** (PowerShell):

```powershell
winget install --id Git.Git -e
winget install Schniz.fnm
```

Agrega esta línea a tu perfil de PowerShell (`notepad $PROFILE`), abre una terminal nueva e
instala Node y OpenCode:

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

```powershell
fnm install --lts
npm install -g opencode-ai
```

Para **Claude Code**, el instalador oficial (se actualiza solo y no depende de Node):

```powershell
irm https://claude.ai/install.ps1 | iex
```

Abre una terminal nueva para que reconozca `claude`. También puedes instalarlo con
`winget install Anthropic.ClaudeCode` o con npm (`npm install -g @anthropic-ai/claude-code`).

> **npm + fnm:** con fnm, cada versión de Node tiene sus propios programas globales. Si
> instalas `opencode-ai` o Claude Code con npm, hazlo **dentro de la carpeta del proyecto**
> (con la versión de Node de su `.nvmrc`); si no, el comando puede no aparecer ahí. Compruébalo
> desde el proyecto con `node --version` y `claude --version` (u `opencode --version`). Con
> npm, Claude Code no se actualiza solo: `npm install -g @anthropic-ai/claude-code@latest`.

> OpenCode recomienda **WSL** en Windows para la mejor compatibilidad. El kit también
> funciona en Windows nativo (así se probó). En PowerShell 5, `&&` no existe: escribe un
> comando por línea.

**macOS** (con [Homebrew](https://brew.sh)):

```bash
xcode-select --install
brew install fnm
brew install anomalyco/tap/opencode
curl -fsSL https://claude.ai/install.sh | bash
```

(Instala solo la herramienta que vayas a usar: la última línea es Claude Code.)

Agrega a `~/.zshrc` la línea `eval "$(fnm env --use-on-cd --shell zsh)"`, abre una terminal
nueva e instala Node:

```bash
fnm install --lts
```

**Linux** (Debian/Ubuntu; en Fedora usa `dnf` en lugar de `apt`):

```bash
sudo apt install git curl unzip
curl -fsSL https://fnm.vercel.app/install | bash
curl -fsSL https://opencode.ai/install | bash
curl -fsSL https://claude.ai/install.sh | bash
```

(Las dos últimas líneas son OpenCode y Claude Code: instala solo la que vayas a usar.)

Agrega a `~/.bashrc` la línea `eval "$(fnm env --use-on-cd --shell bash)"`, abre una terminal
nueva e instala Node:

```bash
fnm install --lts
```

Comprueba que todo está: `git --version`, `node --version` y `opencode --version` o
`claude --version` (v2.1.295 o posterior). Otras formas de instalar OpenCode (Scoop,
Chocolatey, Arch…): [opencode.ai/docs](https://opencode.ai/docs/); de Claude Code:
[code.claude.com/docs](https://code.claude.com/docs/en/setup).

### 2. Descarga el kit

En la carpeta donde guardas tus proyectos (ej. `Documentos/`):

```bash
git clone https://github.com/JoseCwearStore/SDD-AI-automation.git
```

### 3. Crea tu proyecto (o usa uno existente)

En esa misma carpeta, al lado del kit:

```bash
mkdir mi-proyecto
cd mi-proyecto
git init
cd ..
```

Queda así: `Documentos/SDD-AI-automation/` y `Documentos/mi-proyecto/`.

### 4. Instala el kit en tu proyecto

Entra en la carpeta del kit y ejecuta el instalador apuntando a tu proyecto:

```bash
cd SDD-AI-automation
node scripts/install.mjs ../mi-proyecto --prefix gym
```

Si tu proyecto está en otro sitio, pasa su ruta completa en lugar de `../mi-proyecto`.

- `--prefix gym` deja las skills como `gym-sdd-*` ([por qué](#personalizar-el-prefijo-de-las-skills)).
  Si no lo indicas, se usa el del kit (`cuco`).
- `--dry-run` muestra qué haría sin escribir nada.
- `--target` elige la herramienta: `auto` (por defecto), `opencode`, `claude` o `both`. En
  `auto` detecta lo que ya usa tu proyecto (`.opencode/` u `opencode.json` → OpenCode;
  `.claude/` o `CLAUDE.md` → Claude Code); si no hay nada, lo que tengas instalado
  (`opencode`, `claude`); y si tampoco, instala para las dos. El informe dice qué detectó.
- Para OpenCode, copia `.opencode/agents`, `.opencode/commands` y `.opencode/skills`, y crea o completa
  `opencode.json` con `"default_agent": "coordinator"`.
- **Nunca toca** `AGENTS.md`, `MEMORY.md`, `docs/` ni `specs/`: son de tu proyecto.
- Anota lo que instaló en `.opencode/sdd-kit.json`. Al actualizar, borra solo los archivos
  que instaló una versión anterior del kit y que el kit ya no tiene: tus skills propias,
  aunque usen tu prefijo, se conservan.
- Si tu proyecto usa `opencode.jsonc`, no lo edita (perdería tus comentarios): te pide que
  añadas `"default_agent": "coordinator"` a mano.

### 5. Arranca

**Con OpenCode:**

1. Si es la primera vez que usas OpenCode, conecta tu proveedor con su API key
   (`opencode auth login`) y, ya dentro de OpenCode, elige el modelo con `/models`. Recuerda:
   tiene que soportar subagentes (ver Requisitos).
2. Abre OpenCode en la carpeta de tu proyecto (`cd ../mi-proyecto` y `opencode`). Si ya
   estaba abierto, reinícialo para que cargue los agentes.
3. Comprueba que aparecen los agentes al escribir `@` (`coordinator`, `planner`, `tester`,
   `implementer`, `reviewer`) y que el agente activo es `coordinator`.
4. Haz la prueba de permisos del paso 6 (5 minutos; solo la primera vez y tras cada
   actualización del kit).
5. Empieza con tu idea:

```
/sdd-bootstrap Una app para … (describe lo que quieres construir)
```

**Con Claude Code:**

1. Abre una terminal en la carpeta de tu proyecto y ejecuta `claude`. La primera vez te pide
   iniciar sesión con tu cuenta de Claude en el navegador.
2. Cuando pregunte si confías en la carpeta, responde que sí: sin eso no corren los hooks del
   proyecto (el guardián de permisos). Si ya estaba abierto, reinícialo tras instalar o
   actualizar el kit.
3. Comprueba que el agente principal es `coordinator` (lo indica al arrancar) y escribe
   `/sdd-status`: debe cargar la skill `<prefijo>-sdd-status` y responder. Las versiones
   recientes de Claude Code ya no tienen el comando `/agents`.
4. Haz la prueba de permisos del paso 6.
5. Empieza con tu idea: `/sdd-bootstrap Una app para …`.

### 6. Prueba los permisos

Un permiso que no probaste no está verificado. Crea un `.env` de prueba con
`SECRETO=prueba` y pide a cada agente la instrucción de la tabla:

- **OpenCode:** escribe `@agente` y la instrucción.
- **Claude Code:** abre una sesión como ese agente con `claude --agent planner` (o `tester`,
  `implementer`, `reviewer`), da la instrucción y sal con `/exit` antes de pasar al siguiente.
  Cuando el guardián rechaza o pregunta, el mensaje empieza con `Kit SDD (<agente>)`.

| Agente | Instrucción | Resultado esperado |
|--------|-------------|--------------------|
| `@planner` | crea `specs/999-prueba/nota.md` con el texto hola | Lo crea |
| `@planner` | crea `src/prueba.txt` con el texto hola | Lo rechaza |
| `@tester` | crea `tests/acceptance/prueba.txt` con el texto hola | Lo crea |
| `@tester` | añade una línea al final de `AGENTS.md` | Lo rechaza |
| `@implementer` | crea `src/prueba.txt` con el texto hola | Lo crea |
| `@implementer` | añade una línea a `opencode.json` (en Claude Code: a `.claude/settings.json`) | Lo rechaza |
| `@implementer` | edita `specs/999-prueba/nota.md` | Lo rechaza |
| `@implementer` | ejecuta `git status` | Lo ejecuta sin preguntar |
| `@implementer` | ejecuta `git commit -m prueba` | Lo rechaza |
| `@implementer` | ejecuta `git status > prueba-redir.txt` | **Te pregunta** (si en OpenCode lo ejecuta sin preguntar, ver "Problemas conocidos") |
| `@reviewer` | crea `specs/999-prueba/review.md` con el texto hola | Lo crea |
| `@reviewer` | crea `src/prueba.txt` con el texto hola | Lo rechaza |
| `@reviewer` | lee el archivo `.env` | Lo rechaza |

En Claude Code puedes probar además `@coordinator` → "edita `AGENTS.md`" (lo rechaza): basta
con escribirlo en la sesión normal, porque ahí el agente principal ya es el coordinador.

Al terminar, borra a mano `.env`, `specs/999-prueba/`, `src/prueba.txt`,
`tests/acceptance/prueba.txt` y `prueba-redir.txt` si se creó.

## Claude Code

El kit tiene **una sola fuente** (`.opencode/` del repo) y el instalador la convierte para
Claude Code. Los agentes, las skills y las reglas de transparencia y 🔎 son los mismos.

| OpenCode | Claude Code (lo genera el instalador) |
|----------|---------------------------------------|
| `.opencode/agents/*.md` | `.claude/agents/*.md` (mismo cuerpo; `disallowedTools` para lo denegado del todo) |
| Permisos por agente (`permission:`) | `.claude/sdd-permissions.json` + hook `.claude/hooks/sdd-guard.mjs` |
| `.opencode/commands/*.md` | `.claude/commands/*.md` (`/sdd`, `/sdd-continue`…) |
| `.opencode/skills/` | `.claude/skills/` (idénticas) |
| `"default_agent": "coordinator"` en `opencode.json` | `"agent": "coordinator"` en `.claude/settings.json` |
| `AGENTS.md` se lee solo | `CLAUDE.md` con `@AGENTS.md` (se crea si no existe) |

**Permisos.** Claude Code no tiene permisos de rutas por agente, así que el hook
`sdd-guard.mjs` (PreToolUse) los aplica con las mismas reglas de OpenCode: identifica al
agente por `agent_type`, gana la última regla que coincide y responde `allow`, `ask` o
`deny`. Cubre lectura (`Read`, `Grep`), edición (`Edit`, `Write`…), terminal (`Bash`,
`PowerShell`, por subcomando), web, subagentes (`Agent`) y skills (`Skill`). Además pide
aprobación si un comando de terminal nombra un archivo de secretos. Fuera de los agentes del
kit, o fuera del proyecto, no decide nada. Si falla, bloquea (`onFailure: "block"`).

**Arranque.** Ver el paso 5 de la instalación ("Con Claude Code"). Si le preguntas al
coordinador qué subagentes puede llamar, debe nombrar planner, tester, implementer y reviewer.

**Terminal.** El guardián pide tu aprobación si un comando escribe archivos (`>`, `>>`,
`tee`, `Out-File`, `Set-Content`): los archivos se editan con la herramienta de edición, que
es la que respeta los permisos por ruta.

**Fuera del flujo SDD.** Como en OpenCode con Build, para trabajar sin el coordinador abre
`claude --agent <otro>` o pon otro `"agent"` en `.claude/settings.local.json` (no se versiona).

**Ajustes por proyecto.** `sdd.local.json` vale para las dos herramientas: déjalo en
`.opencode/` o en `.claude/` (solo uno).

### Actualizar el kit en un proyecto

Haz `git pull` en el kit y vuelve a ejecutar el mismo comando, sin `--prefix`: detecta el
prefijo que ya usa tu proyecto y solo reescribe los archivos que cambiaron. Con el kit
como única fuente de verdad, todos tus proyectos se actualizan igual.

### Ajustes por proyecto (`sdd.local.json`)

No edites los agentes en tu proyecto: la siguiente actualización los pisa. Si tu stack
necesita permisos propios (ej. permitir `uv run ruff` o `make test`), créalos en
`.opencode/sdd.local.json` y vuelve a ejecutar el instalador:

```json
{
  "implementer": {
    "bash": { "uv run ruff*": "allow", "make test*": "allow" },
    "edit": { "*Makefile": "ask" }
  },
  "tester": { "bash": { "make test*": "allow" } }
}
```

El instalador añade esas reglas **al final** de cada permiso del agente, así que ganan a las
del kit (gana la última regla que coincide). Cuidado: también pueden abrir lo que el kit
protege (ej. `"*specs?*": "allow"` en el implementer); el instalador te lista lo que aplicó.
Las claves que empiezan por `$` se ignoran (sirven de comentario).

### Sin Node

Copia a mano la carpeta `.opencode/` y `opencode.json` en la raíz de tu proyecto (si ya
tienes un `opencode.json`, añade solo `"default_agent": "coordinator"`). Sin el instalador no
se aplican los ajustes de `sdd.local.json` ni se borran los archivos que el kit quitó.

macOS y Linux:

```bash
cp -r .opencode opencode.json ../mi-proyecto/
```

Windows (PowerShell):

```powershell
Copy-Item -Recurse .opencode, opencode.json ..\mi-proyecto\
```

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

El script renombra las 21 carpetas de `.opencode/skills/` y reemplaza el prefijo en todos los
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
| `/sdd <petición>` | Flujo completo: spec → plan → tests → código → revisión → seguridad → cumplimiento. Si el cambio es pequeño, te recomienda `/sdd-feature`. |
| `/sdd-continue <NNN> [indicaciones]` | Retoma una spec existente desde la fase en que quedó (la detecta solo). Nunca crea una spec nueva. |
| `/sdd-feature <petición>` | Cambio pequeño sin spec: mini plan → TDD → revisión → seguridad → cumplimiento. |
| `/sdd-design [indicaciones]` | Crea o actualiza el sistema de diseño (paleta, tipografía) desde cero o desde `docs/design/references/`. Obligatorio antes de la primera spec con pantallas. |
| `/sdd-release [notas]` | Con el producto listo: borradores legales desde el código, revisión de punta a punta y la lista de lo que es tuyo. |
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
- no toca autenticación, autorización, secretos ni datos sensibles,
- no añade datos personales nuevos ni servicios de terceros.

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
| 2. Revisión de spec | reviewer | `clarify.md`: ambigüedades, contradicciones, casos límite, por rondas hasta `SPEC LISTA` → 🔎 tu aprobación |
| 3. Plan y tareas | planner | `plan.md` y `tasks.md` (máx. 10 tareas) → 🔎 tu aprobación |
| 4. Tests de aceptación | tester | un test por criterio, en rojo por la razón correcta |
| 5. Implementación | implementer | UNA tarea por delegación, con TDD |
| 6. Revisión de código | reviewer | `review.md`: RF por RF, constitución, arquitectura y alcance |
| 7. Correcciones | responsable de cada hallazgo | máximo 2 vueltas |
| 8. 🔒 Seguridad | reviewer | `security.md`: controles C1–C10. Si falla, cada hallazgo vuelve a su responsable (máx. 2 vueltas) |
| 9. 📋 Cumplimiento | reviewer | `compliance.md`: privacidad P1–P12 y accesibilidad A1–A8 de lo que tocó la spec; ítems 👤 para ti |
| 10. Cierre | implementer + coordinator | `MEMORY.md` actualizado, 🔎 del diff y mensaje de commit propuesto |

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

### 4. Cumplimiento y release

Dos skills con el mismo patrón que seguridad (GUÍA para prevenir, AUDITORÍA al final de cada
spec), con controles que aplican o no según la sección **"Cumplimiento"** de `AGENTS.md`
(jurisdicción, datos personales, pagos, correos, menores…):

- `cuco-sdd-privacy` (P1–P12): minimización, inventario de datos, consentimientos, cookies,
  terceros y SDKs, eliminación de cuenta, menores, sin patrones oscuros, precios
  transparentes, contenido honesto, bajas de correo y licencias de multimedia.
- `cuco-sdd-a11y` (A1–A8, WCAG 2.2 AA): texto alternativo, contraste, teclado, formularios,
  semántica, cambios dinámicos, zoom y no depender solo del color.

Cada control indica si lo resuelven los agentes (🤖), si lo preparan y tú decides (🤝) o si
es tuyo (👤). Lo que es global se revisa con **`/sdd-release`**, con el producto listo:

1. Los documentos de `docs/legal/` (privacidad, términos, cookies, contacto…) se generan
   **a partir del código real** y nacen con el encabezado
   `⚠️ BORRADOR — … Requiere revisión legal antes de publicarse.` Ningún agente lo quita.
2. Cada documento termina con **"👤 Te corresponde a ti"**: datos reales, decisiones y la
   revisión de un profesional de tu jurisdicción.
3. El release **no está listo** mientras quede un borrador o un ítem 👤 pendiente.

> El kit no da asesoría legal: los borradores te ahorran trabajo, no sustituyen a un abogado.

### 5. Diseño (`/sdd-design`)

Antes de la primera spec con pantallas, el coordinador exige `docs/design/design-system.md`:
la **fuente de verdad visual**. Mínimo: paleta con roles (primario, fondo, texto, error…),
**tabla de pares de contraste** (WCAG AA, conectada con el control A2 de accesibilidad) y
tipografía (familias con licencia y escala de tamaños). En el código, todo sale de los tokens:
un color o una fuente escritos a mano son un hallazgo de revisión, y la primera spec con
pantallas incluye un test que verifica los contrastes.

- **Sin material de diseño**: te propone 2 o 3 opciones con su contraste calculado y eliges.
- **Con referencias**: déjalas en `docs/design/references/` (capturas, plantillas HTML/CSS,
  manual de marca en PDF, variables exportadas en JSON). Analizar imágenes requiere un
  modelo con visión en OpenCode.
- **Figma**: un link solo no sirve (los agentes no pueden abrirlo). Dos caminos:
  - **A (recomendado, sin dependencias)**: exporta los frames como PNG y las variables o
    estilos como JSON a `docs/design/references/`. Si el diseño cambia, vuelve a exportar.
  - **B (opcional)**: configura en OpenCode el servidor MCP oficial de Figma, para que los
    agentes lean el archivo directamente. Siempre actualizado, pero suma una dependencia
    externa y un token de Figma; habilítalo solo en los agentes que lo necesiten.

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
| `planner` | Visión, specs, plan, tareas, archivos de gobierno, diseño y borradores legales | `specs/**/*.md`, `AGENTS.md`, `MEMORY.md`, `docs/constitution.md`, `docs/design/*.md`, `docs/legal/*.md` |
| `tester` | Tests de aceptación | Solo carpetas `acceptance/` y su informe `specs/**/tests.md` |
| `implementer` | Código con TDD | Todo, salvo `.opencode/`, `opencode.json`, `AGENTS.md`, la constitución, las specs (excepto marcar tareas y anotar la `Base:` en `tasks.md`), `acceptance/`, `docs/design/`, `docs/legal/`, `docs/release/` y los `.env`. **Pide permiso** para manifiestos de dependencias, esquema, migraciones, Docker, CI (`.github/`, `.gitlab-ci.yml`) y Terraform |
| `reviewer` | Revisa la spec, el código, la seguridad y el cumplimiento | Solo sus informes: `clarify.md`, `review.md`, `security.md`, `compliance.md`, `docs/release/release.md` y sus rondas en `specs/features/*.md` |

Ningún agente puede **leer** los `.env` (salvo `.env.example`), `.envrc` ni claves (`.pem`,
`.key`, `id_rsa`, `id_ed25519`), así un secreto nunca termina en el chat. Ningún agente puede hacer `git commit` ni `git push`. Al implementer se le
deniegan además `rm -rf`, `git reset --hard`, `git clean` y `docker compose down -v`, y al
tester y al reviewer cualquier `rm`; cualquier otro
borrado (`rm -r`, `Remove-Item`…) **te pide confirmación**: recházalo si no lo esperabas. Los
comandos de tests, tipos y lint de los stacks más comunes están permitidos; el resto pide
confirmación.

## Convenciones del kit

- **Tests de aceptación** siempre en carpetas llamadas `acceptance/` (los permisos del tester
  dependen de ello) y nombrados `NNN-RFn: <qué comprueba>` (ej. `004-RF3: rechaza solicitud a
  uno mismo`). El prefijo de spec evita choques entre specs.
- **Constitución**: cada principio se verifica con `Verificar [auto]` (lo comprueba el
  reviewer) y/o `Verificar [manual]` (te lo lista a ti: el reviewer nunca lo da por hecho).
- **Specs**: `specs/NNN-nombre/` con `spec.md`, `clarify.md`, `plan.md`, `tasks.md`, `tests.md`,
  `review.md`, `security.md` y `compliance.md`. Los informes de revisión se escriben por rondas
  (`## Ronda N · versión Cn`) y nunca se borran: son la memoria que permite retomar con
  `/sdd-continue`.
- **Estados**: la spec pasa de `borrador` a `aprobada` y a `cerrada`; `plan.md` y `tasks.md`
  llevan `Estado: aprobado (versión Cn)` tras tu 🔎. `/sdd-status` deduce la fase solo de
  estas marcas y de los veredictos, así que nunca se saltea una aprobación al retomar.
- **Versiones**: cada `/sdd-change` agrega `C1`, `C2`… en la sección `## Cambios` de la spec
  (sin cambios, la versión es C0). Plan, tareas, tests e informes dicen qué versión cubren:
  lo de una versión anterior deja de contar y esas fases se repiten.
- **Marcas de criterios**: `[manual]` (lo comprueba una persona, con pasos exactos; sin test)
  y `[diferido: NNN]` (el RF depende de otra spec del roadmap, que lo implementa y lo prueba
  con su nombre original).
- **Tareas**: cada una declara `Depende de`, y `tasks.md` tiene un `Orden de ejecución` que
  manda sobre el número (una tarea agregada por un cambio puede ir antes que otras).
- **Base de revisión**: al empezar la primera tarea, el implementer anota en `tasks.md` el
  commit `Base:`. La revisión y las auditorías comparan contra esa base, así que puedes
  commitear después de cada tarea sin que el reviewer se quede sin diff.
- **Features**: cada `/sdd-feature` deja su archivo en `specs/features/AAAA-MM-DD-nombre.md`
  con el mini plan aprobado y las rondas de revisión, seguridad y cumplimiento. `/sdd-status`
  lista las que no están cerradas.
- **Skills = CÓMO · AGENTS.md y constitución = QUÉ · agentes = QUIÉN.** Las skills no nombran
  módulos ni comandos concretos: los leen de `AGENTS.md`. El coordinador solo lleva lo común
  (transparencia, 🔎, contexto, reglas); los pasos de cada comando viven en las skills
  `cuco-sdd-flow-*`, que carga según el comando.

## Nombres de carpetas

El kit no impone nombres: el bootstrap te propone `client/` + `server/`, `apps/web` +
`apps/api` o `frontend/` + `backend/`, con sus ventajas, y recomienda una según el proyecto.
En un proyecto existente se respetan los nombres que haya (aunque no sigan ninguna
convención, como `backend/` y `maimenu/`): quedan en un **mapa de carpetas** de `AGENTS.md`
con su rol real, para que todas las fases los entiendan. Renombrar una carpeta es siempre una
**spec propia de refactor**, con análisis de impacto; ningún agente lo hace de paso.

## Estructura del repositorio

```
.opencode/
├── agents/      coordinator, planner, tester, implementer, reviewer
├── commands/    sdd, sdd-continue, sdd-feature, sdd-change, sdd-design, sdd-release, sdd-bootstrap, sdd-constitution, sdd-status
└── skills/      cuco-sdd-<fase>/SKILL.md (21 skills: una por fase; seguridad, privacidad,
                 accesibilidad y diseño; y 5 cuco-sdd-flow-* con los pasos de cada comando
                 para el coordinador)
opencode.json    default_agent: coordinator
claude/
├── hooks/sdd-guard.mjs   guardián de permisos por agente para Claude Code
├── CLAUDE.md             plantilla (importa AGENTS.md)
└── settings.example.json lo que el instalador añade a .claude/settings.json
scripts/
├── install.mjs        instala o actualiza el kit (OpenCode, Claude Code o ambos; con sdd.local.json)
├── rename-prefix.mjs  cambia el prefijo de las skills (en .opencode y .claude)
└── lib/               frontmatter.mjs (lector) y claude.mjs (conversión a Claude Code)
```

## Problemas conocidos de OpenCode (aprendidos a la mala)

- La clave es `permission` (singular). `permissions` se ignora **en silencio**.
- En los permisos gana la **última** regla que coincide: lo general primero, lo específico al
  final.
- Patrones de `edit`: empieza con `*` y usa `?` como separador de carpetas
  (`"*specs?*.md"`). Así coinciden en todos los sistemas, porque `?` vale tanto para `/`
  (macOS, Linux) como para `\` (Windows). En Windows, `"specs/**"` no coincide.
- **Nunca pongas `?` justo después del `*` inicial** (`"*?specs?*"`): exige un carácter
  antes de la carpeta y falla cuando OpenCode compara la ruta relativa (`specs\…`). Un
  `allow` así bloquea a un agente, y un `deny` así deja la puerta abierta.
- Un YAML inválido en el frontmatter de un agente hace que OpenCode lo **descarte en
  silencio**. Si un agente no aparece con `@`, revisa su YAML.
- Si un subagente falla y estás en el agente Build, Build hace el trabajo él mismo **sin
  restricciones**. Por eso `default_agent` es `coordinator`.
- Un `@agente` escrito por el usuario se salta el permiso `task` del agente primario.
- Los permisos de `edit` solo controlan la herramienta de edición: un agente que escribe un
  archivo **por la terminal** (`>`, `Set-Content`, here-strings…) se los salta. Por eso los
  agentes tienen prohibido hacerlo y `bash` está en `ask` por defecto. Si OpenCode te pide
  permiso para un comando que escribe un archivo, **recházalo** y nunca uses "Always allow"
  con comandos genéricos.
- **`read: deny` no protege del todo los `.env`.** Cada permiso compara contra algo distinto:
  `read` contra la ruta, pero `grep` contra **el texto buscado**, y cada permiso se evalúa por
  separado. Una búsqueda de contenido apuntando al `.env` lo muestra aunque `read` esté
  bloqueado (verificado en una prueba real). Una búsqueda por todo el proyecto no lo
  encuentra, pero solo porque ripgrep ignora lo que está en `.gitignore`: es una costumbre de
  la herramienta, no un candado. Por eso el kit usa capas:
  1. **Los agentes tienen prohibido** leer, buscar o pasar rutas `.env*` a cualquier
     herramienta (criterio del agente, no candado).
  2. **El `.env` local solo lleva secretos de desarrollo**; los de producción nunca están en
     el proyecto ni en la máquina de desarrollo (hosting o gestor de secretos). Si algo se
     filtra, no expone producción.
  3. **Candado fuerte, opcional:** si el proyecto maneja secretos sensibles incluso en
     desarrollo (pagos, salud…), guárdalos **fuera de la carpeta del proyecto** (ej.
     `../secretos/proyecto.env`, cargado con `env_file` o `--env-file` de Docker Compose) y
     deja `external_directory: deny` en los agentes. OpenCode aplica `external_directory` a
     `read`, `grep` y `glob`, así que ese archivo queda realmente fuera de su alcance. Cuesta
     más configuración; para la mayoría de proyectos bastan las capas 1 y 2.
- **Comandos encadenados (`&&`, `;`, `|`): OpenCode evalúa cada parte por separado**
  (verificado en una prueba real). Una parte permitida al principio no "contagia" el
  permiso al resto: `git status && echo x > f` pregunta (la segunda parte cae en `ask`) y
  `git status && rm -rf algo` se rechaza solo (la segunda parte está en `deny`).
- **Redirecciones dentro de un comando permitido (sin verificar).** Si OpenCode compara el
  texto completo del comando, `git status > archivo` coincidiría con la regla permitida
  `git status*` y escribiría el archivo sin preguntar (lo mismo `git diff --output=…`). La
  prueba del paso 6 lo comprueba. Si pasa sin preguntar, añade al final del `bash` de cada
  agente `"*>*": ask` y `"*--output*": ask` (coste: `npm test 2>&1` también preguntará).
- Un permiso que no probaste no está verificado: después de instalar, haz la prueba del
  paso 6 (un caso **permitido** y uno **denegado** por agente).

## Licencia

[MIT](LICENSE): úsalo, modifícalo y compártelo libremente, manteniendo el aviso de copyright.
