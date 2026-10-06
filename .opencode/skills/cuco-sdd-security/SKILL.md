---
name: cuco-sdd-security
description: SDD · Seguridad con 10 controles (C1–C10). Modo GUÍA - checklist para prevenir al escribir spec, plan y código. Modo AUDITORÍA - última fase del flujo, verifica los controles, escribe security.md con veredicto y asigna cada hallazgo a su responsable.
---
Si no existe `AGENTS.md`, o le falta la sección "Seguridad", PARA y devuelve BLOQUEADO
indicando qué falta y recomendando `/sdd-bootstrap`.

Lee `AGENTS.md` (sobre todo "Seguridad", "Arquitectura" y "Comandos") y
`docs/constitution.md`. El modo (GUÍA o AUDITORÍA) y las rutas te los pasa el coordinador.
Lo concreto del stack (librerías, límites, nombres de roles) está en la sección "Seguridad"
de `AGENTS.md`: esta skill define QUÉ controlar y CÓMO comprobarlo.

## Reglas que valen siempre
- Nunca leas `.env` ni `.env.*` (salvo `.env.example`), ni muestres el valor de un secreto.
  Si encuentras uno, informa solo `archivo:línea` y el tipo (ej. "clave privada").
- Seguridad por defecto: si no está claro que algo sea público, es privado.
- En hexagonal: la **autenticación** (quién eres) vive en `infrastructure/` (middleware,
  tokens, cookies); la **autorización** (qué puedes hacer) son reglas puras en `domain/` o
  `application/`, testeables sin infraestructura. El logger es un puerto con su adaptador.

## Los 10 controles

**C1 · Rate limiting.** Los endpoints públicos y los de autenticación (login, registro,
recuperación de contraseña) tienen límite de peticiones por IP y/o por usuario. Al superarlo:
429 con `Retry-After`. Los límites concretos están en `AGENTS.md`.

**C2 · Secretos solo en el servidor.** Claves de API, secretos de tokens y credenciales:
- nunca en código del cliente ni en variables que el bundler expone al navegador
  (`VITE_*`, `NEXT_PUBLIC_*`, `REACT_APP_*`, `EXPO_PUBLIC_*`, `PUBLIC_*`…);
- nunca escritos en el código fuente, en tests, en fixtures ni en logs;
- se leen del entorno solo en la configuración de infraestructura / composition root.
Si el cliente necesita llamar a un servicio con secreto, lo hace a través del backend.

**C3 · RLS en todas las tablas** (solo si la base es PostgreSQL, incluido Supabase; si no,
`AGENTS.md` dice "No aplica" y por qué). Cada tabla nueva nace en su migración con
`ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY` (el dueño de la tabla se salta RLS
si no se fuerza) y sus políticas. Si la app usa un único rol de servicio, RLS es defensa en
profundidad: la autorización principal sigue en el dominio.

**C4 · Variables de entorno fuera de git.** `.env` y `.env.*` en `.gitignore`, salvo
`.env.example`, que solo lleva nombres y valores de ejemplo (nunca reales). Ningún secreto
en el diff. Variables nuevas: se añaden a `.env.example` con un valor ficticio.

**C5 · Validación de entradas.** Toda entrada externa (body, query, params, headers,
archivos, mensajes) se valida en el borde (`infrastructure/`) con un esquema: tipo,
longitud, formato y rango. Lo inválido se rechaza con 400 sin devolver el dato crudo.
Consultas siempre parametrizadas (nunca SQL concatenado). En el frontend, nunca HTML sin
escapar con datos del usuario (`innerHTML`, `dangerouslySetInnerHTML`, `v-html`). Las
invariantes de negocio las siguen garantizando los value objects del dominio.

**C6 · Ninguna tabla pública.** La app se conecta con un rol de mínimo privilegio (no
superusuario, sin `GRANT` a `PUBLIC`). La base de datos no se expone a internet (puerto no
publicado fuera del entorno local). En Supabase: ninguna tabla del esquema expuesto por la
API sin RLS, y la clave `anon` sin acceso salvo política explícita.

**C7 · Auth en rutas protegidas.** Denegar por defecto: toda ruta exige autenticación salvo
las listadas como públicas en el plan. Sin sesión → 401; sin permiso → 403. Acceder a un
recurso ajeno cambiando su id (IDOR) → 403 o 404, nunca los datos.

**C8 · Errores sin stack traces.** Un único manejador de errores en el borde. Al cliente:
mensaje genérico y un id de correlación para los 500; nunca stack, SQL, rutas de archivos,
versiones ni nombres internos. El detalle va solo al log del servidor.

**C9 · Debug y admin bloqueados.** Ninguna ruta de debug, test, seed o diagnóstico se
registra en producción (o no existe). Las de administración exigen un rol explícito. Nada
de documentación de API, consolas o source maps abiertos en producción sin protección.

**C10 · Logging de seguridad.** El logger es un puerto. Se registran: login correcto y
fallido, 401, 403, 429, errores de validación, cambios de permisos y acciones de admin,
con fecha, ruta, id de usuario (si hay), IP e id de correlación. NUNCA se registran
contraseñas, tokens, cookies, secretos ni datos personales completos.

## Modo GUÍA (prevenir)
Lo usan el planner y el implementer. No genera archivos propios: aplica los controles a lo
que estás escribiendo.
- **Spec** (planner): la sección "Acceso y seguridad" declara quién puede hacer qué, qué es
  público, qué entradas llegan de fuera y sus límites. Cada regla de acceso es un RF EARS
  con su criterio (ej. "SI un usuario no autenticado pide su feed, ENTONCES el sistema DEBE
  rechazarlo"). Sin stack ni librerías.
- **Plan** (planner): la sección "Seguridad" recorre C1–C10: para cada uno, "Aplica: cómo"
  o "No aplica: por qué". Incluye la lista explícita de rutas públicas. Librerías nuevas
  (limitador, logger, validación) → "⚠️ Requiere aprobación".
- **Código** (implementer): cumple la sección "Seguridad" del plan y los controles que toca
  tu tarea. Si un control no se puede cumplir con lo que dice el plan, devuelve PREGUNTAS:
  no lo resuelvas por tu cuenta.

## Modo AUDITORÍA (última fase)
Lo usa el reviewer, después de la revisión de código. Solo detectas: no corriges nada.

1. Lee también: de `specs/NNN-nombre/`, `spec.md` (sección "Acceso y seguridad"), `plan.md`
   (sección "Seguridad") y `security.md` si existe. En modo feature, el mini plan aprobado.
2. Revisa el diff (`git diff`, `git status`). Para C2, C4 y C6 revisa además todo el
   repositorio de forma ligera (`git ls-files`, búsquedas): un secreto viejo también cuenta.
3. Si la sección "Comandos" de `AGENTS.md` define "Verificación de seguridad" con un comando
   (no "No aplica…"), ejecútala. Si dice "No aplica hasta la spec NNN", no la ejecutes:
   los controles que cubriría (ej. C3) quedan como MANUAL en esta auditoría.
4. Para cada control, uno de estos resultados:
   - **CUMPLE**: con la evidencia (test, comando o `archivo:línea`).
   - **NO CUMPLE**: es un hallazgo.
   - **NO APLICA**: con el porqué (ej. "el cambio no añade rutas").
   - **MANUAL**: no lo puedes comprobar tú (ej. la consulta de RLS sin acceso a la base, el
     historial completo de git, la configuración de producción). Escribe los pasos exactos
     para el usuario.
5. Cada hallazgo lleva su **Responsable**:
   - **planner**: falta la regla de acceso en la spec o el control en el plan.
   - **tester**: la spec lo pide y no hay test que lo pruebe (401/403, 429, error sin stack…).
   - **implementer**: el código no cumple el control.

Comprobaciones mínimas por control (además de leer el código del diff):
- C1: hay un test que espera 429 en los endpoints con límite.
- C2: búsqueda de patrones de secreto (claves privadas, `sk_live`, `AKIA`, cadenas de
  conexión con contraseña, `secret`/`password`/`token` con valor literal) y de secretos en
  variables expuestas al cliente.
- C3: cada migración nueva incluye ENABLE + FORCE + políticas. Consulta de tablas sin RLS
  (si no puedes ejecutarla, MANUAL con esta consulta):
  `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE
  c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog','information_schema') AND
  (NOT c.relrowsecurity OR NOT c.relforcerowsecurity);`
- C4: `.gitignore` cubre `.env*` salvo `.env.example`; `git ls-files` no lista ningún
  `.env` real; `.env.example` sin valores reales.
- C5: cada entrada nueva tiene esquema de validación y un test con entrada inválida.
- C6: migraciones y scripts sin `GRANT … TO PUBLIC` ni roles con superusuario; puerto de la
  base no publicado en la configuración de producción.
- C7: inventario de rutas del diff contra la lista de públicas del plan; test 401/403 por
  cada ruta protegida nueva.
- C8: test que provoca un error 500 y comprueba que la respuesta no trae stack ni detalles.
- C9: búsqueda de rutas `debug`, `test`, `seed`, `internal`, `admin`, `swagger`, `graphql`
  y de cómo se protegen en producción.
- C10: test (con logger falso) de que un login fallido o un 429 emite un evento; búsqueda
  de logs que incluyan campos sensibles.

### Qué bloquea
- **Bloquea** (CAMBIOS NECESARIOS): cualquier NO CUMPLE de un control que aplica.
- **No bloquea**: los MANUAL (el coordinador se los muestra al usuario) y las sugerencias
  "Opcional".

### Guarda el veredicto en `specs/NNN-nombre/security.md`
En modo feature no escribes archivo: el veredicto va en tu respuesta. Si el archivo ya
existe, agrega `## Ronda N` debajo de la anterior y verifica primero, uno por uno, los
hallazgos de la ronda anterior.

    ## Ronda 1
    VEREDICTO: SEGURO | CAMBIOS NECESARIOS

    | Control | Resultado | Evidencia |
    |---------|-----------|-----------|
    | C1 Rate limiting | CUMPLE / NO CUMPLE / NO APLICA / MANUAL | test, comando o archivo:línea |

    ### Hallazgos que bloquean
    1. C7 · `archivo:línea` — qué incumple — qué se espera — **Responsable**: planner | tester | implementer

    ### Checks manuales (a cargo del usuario)
    - [ ] C3 — pasos exactos.

    ### Opcional
    - Mejoras que no bloquean.

    ### Ronda anterior (solo desde la ronda 2)
    - Hallazgo 1: resuelto | no resuelto

En tu respuesta, la primera línea es el mismo VEREDICTO.
