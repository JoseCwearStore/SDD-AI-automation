---
name: cuco-sdd-flow-full
description: SDD · Flujo del coordinador para /sdd (triage y fases 1–10), /sdd-continue (retomar una spec) y /sdd-change (cambio de requisitos). Solo la carga el coordinador.
---
Esta skill es para el coordinador. Las reglas de transparencia, 🔎, contexto y contrato de
respuesta de tu definición valen en cada paso. Antes de empezar, haz tu "Verificación
previa".

## /sdd: Fase 0, triage
Si la petición se refiere a una spec que ya existe en `specs/` (por número, nombre o
contenido), NO crees otra: recomienda `/sdd-continue <NNN>` y PARA.
Decide si la petición merece el flujo completo. Es un **cambio pequeño** solo si cumple TODO
(los mismos criterios están en `cuco-sdd-feature`: si cambias uno, cambia los dos):
- toca un único módulo,
- no cambia reglas de dominio de `AGENTS.md`,
- no toca el esquema de datos ni las migraciones,
- no añade dependencias,
- no añade ni cambia contratos del borde (API, CLI, eventos),
- no toca autenticación, autorización, secretos ni datos sensibles,
- no añade datos personales nuevos ni servicios de terceros.
Si los cumple todos: dile al usuario que recomiendas `/sdd-feature` (flujo liviano), explica
en una línea por qué, y PARA: el usuario decide.
Si falla alguno: dile cuál y por qué va por el SDD completo, y sigue con la fase 1.
Si no puedes decidirlo con la petición, pregúntale al usuario lo que falta.

## Fases del flujo completo (en cada delegación, indica la skill que debe cargar)
1. **Spec** → @planner con `cuco-sdd-spec` y, en modo GUÍA, `cuco-sdd-security`,
   `cuco-sdd-privacy` y `cuco-sdd-a11y`. Si devuelve PREGUNTAS, házselas al usuario de una en
   una y vuelve a llamarle con las respuestas. Si devuelve BLOQUEADO por tamaño (más de
   12 RF), muéstrale la partición propuesta y pregúntale cuál prefiere.
2. **Revisión de spec** → @reviewer con `cuco-sdd-clarify`, que guarda sus hallazgos en
   `specs/NNN/clarify.md`. Los "Resuelve: planner" van a @planner (pásale la ruta de
   `clarify.md` y los ids, ej. H1.3); los "Resuelve: usuario", házselos al usuario de uno en
   uno y pasa las respuestas a @planner, que las anota en `clarify.md` como "Decisión del
   usuario". Después, otra ronda de @reviewer hasta `SPEC LISTA`.
   **Convergencia**: desde la 3.ª ronda de la versión vigente en `clarify.md` (cuenta las
   rondas del archivo, no las de esta sesión), si los hallazgos abiertos son solo
   "Resuelve: planner" y de severidad "menor", no lances otra ronda por tu cuenta: ofrece al
   usuario (1) que @planner los aplique y pasar al 🔎 (recomendado), (2) aplicar y una ronda
   más, o (3) pasar al 🔎 sin aplicar, dejándolos como pendientes para el plan. Si hay alguno
   "bloquea", explícale cuál y pregúntale cómo seguir.
   🔎 `spec.md` (y `clarify.md` si el usuario quiere ver el historial). Con el "sí", @planner
   la marca como aprobada.
3. **Plan y tareas** → @planner con `cuco-sdd-plan` (y, en modo GUÍA, `cuco-sdd-security`
   para "Seguridad", `cuco-sdd-privacy` + `cuco-sdd-a11y` para "Cumplimiento" y, si hay
   pantallas, `cuco-sdd-design` para "Diseño") y después con `cuco-sdd-tasks`. Resume todo lo
   marcado con ⚠️, las puertas de versión y la lista de rutas públicas. 🔎 `plan.md` y
   `tasks.md`. Con el "sí", @planner marca los dos como `Estado: aprobado (versión Cn)`: sin
   esa marca, `/sdd-continue` vuelve a esta fase.
4. **Tests de aceptación** → @tester con `cuco-sdd-tests` (y `cuco-sdd-a11y` en modo GUÍA si
   la spec tiene interfaz). Comprueba en su tabla de cobertura que cada criterio de la spec
   tiene un test (salvo `[manual]` y `[diferido]`) y que todos están en rojo por la razón
   correcta. Informa al usuario de los archivos de test creados y de los tests que no se
   pudieron ejecutar (quedan en `specs/NNN/tests.md` con su motivo).
5. **Implementación** → @implementer con `cuco-sdd-implement` (y, en modo GUÍA,
   `cuco-sdd-security`, `cuco-sdd-privacy` y `cuco-sdd-a11y`), UNA vez por tarea, en el
   "Orden de ejecución" de `tasks.md` (no por número). En la primera, @implementer anota la
   `Base:` (el commit contra el que se revisa toda la spec).
   - Antes de cada tarea, muéstrale al usuario sus "Comandos con permiso", sus puertas de
     versión y los ⚠️: OpenCode se los pedirá.
   - Tras cada tarea, informa de los archivos tocados y revisa la salida de comandos de su
     respuesta. Si algo está en rojo (salvo tests de aceptación de tareas aún pendientes),
     PARA y avisa.
   - Muestra el mensaje de commit que propone @implementer y recomienda commitear antes de
     la siguiente (un commit por tarea permite volver atrás con precisión).
   - Si devuelve una tarea "Pendiente de verificación", explícale al usuario qué falta y
     ofrécele dos caminos: (1) resolverlo (dar el permiso, levantar el entorno) y volver a
     llamar a @implementer con esa tarea, o (2) delegar la verificación al reviewer o a él
     mismo: @implementer marca la tarea con `⚠️ Verificación delegada`. Sin una de las dos,
     la siguiente tarea no empieza.
6. **Revisión de código** → @reviewer con `cuco-sdd-review`, pasándole la `Base:` de
   `tasks.md` (igual en las auditorías de las fases 8 y 9). @reviewer escribe su veredicto
   en `review.md`. Muestra al usuario los checks `[manual]` que quedan a su cargo.
7. **Correcciones**: envía cada hallazgo a su **Responsable** (planner, tester o implementer).
   Si hay que cambiar la spec, va por "/sdd-change" (versión nueva, ronda de clarify y 🔎):
   nunca se edita una spec aprobada por fuera de ese flujo. Después, otra vez @reviewer con
   `cuco-sdd-review`. Máximo 2 vueltas (cuéntalas por las rondas de `review.md` de la
   versión vigente); si sigue fallando, PARA y explícale al usuario qué ocurre.
8. **🔒 Seguridad (última verificación)** → solo con `review.md` en APROBADO: @reviewer con
   `cuco-sdd-security` en modo AUDITORÍA. Escribe `security.md`.
   - `VEREDICTO: SEGURO` → muestra al usuario los checks MANUAL y pasa a cumplimiento.
   - `VEREDICTO: CAMBIOS NECESARIOS` → envía cada hallazgo a su **Responsable** con el
     control (C1–C10) y la evidencia. Si hay que cambiar la spec, va por "/sdd-change". Si
     cambia código, @reviewer vuelve a pasar `cuco-sdd-review` antes de la nueva auditoría.
     Después, otra vez la auditoría. Máximo 2 vueltas; si sigue fallando, PARA y explícale
     al usuario qué controles fallan.
9. **📋 Cumplimiento** → solo con `security.md` en SEGURO: @reviewer con `cuco-sdd-privacy`
   y `cuco-sdd-a11y` en modo AUDITORÍA. Escribe `compliance.md`.
   - `VEREDICTO: CUMPLE` → muestra al usuario los ítems 👤 y MANUAL y pasa al cierre.
   - `VEREDICTO: CAMBIOS NECESARIOS` → igual que en seguridad: cada hallazgo a su
     **Responsable**, revisión de código si cambia código y nueva auditoría. Máximo 2
     vueltas; si sigue fallando, PARA y explícale al usuario qué controles fallan.
10. **Cierre**: pide a @implementer que actualice `MEMORY.md` indicando que la spec quedó
    cerrada (incluidos los ítems 👤 pendientes, que se juntan para el release, y los RF
    `[diferido: NNN]` que hereda otra spec) y que incluya en su respuesta el diff completo
    contra la `Base:` (`git diff --stat <base>` y `git status --porcelain -uall`). 🔎 ese
    diff. Con el "sí", @planner cambia la spec a `Estado: cerrada`. Resume qué se hizo, los
    veredictos de revisión, seguridad y cumplimiento, los checks manuales pendientes y
    propón un mensaje de commit convencional. El commit lo hace el usuario.

## /sdd-continue: retomar una spec
1. Si no se indica la spec, carga `cuco-sdd-status` para todas, muéstraselas al usuario y
   pregúntale cuál retomar. PARA.
2. Comprueba que existe `specs/NNN-*/`. Si no existe, dilo y recomienda `/sdd`. PARA.
3. Carga `cuco-sdd-status` para esa spec y dile al usuario, en una línea:
   `↻ Spec NNN · fase <N> · siguiente: @<agente> con <skill> · <qué hará>`.
   Incluye lo pendiente de esa spec: los hallazgos abiertos de `specs/NNN/clarify.md` (si
   existe; es la fuente con el detalle) y lo que figure en `MEMORY.md` ("Pendiente para
   retomar").
4. Continúa en esa fase de "Fases del flujo completo" y sigue desde ahí con normalidad (con
   todos sus 🔎). La Fase 0 y la fase 1 no se repiten: la spec ya existe.
   - Si la spec está en borrador, la fase es la 2 (revisión de spec), aunque falten
     secciones nuevas de la plantilla (ej. "Acceso y seguridad"): @reviewer las marcará y
     @planner las añadirá.
   - Si el usuario añade indicaciones en el comando, pásaselas al subagente de esa fase.
5. Si los archivos se contradicen (ej. tareas marcadas sin tests), muéstralo y pregunta al
   usuario cómo seguir antes de delegar.

## /sdd-change: cambio de requisitos
Si no se indica la spec, pregúntale al usuario cuál es antes de delegar.
1. @planner con `cuco-sdd-change`. Muestra al usuario el diff "Antes / Después" y el impacto.
2. Una ronda de @reviewer con `cuco-sdd-clarify` sobre los RF cambiados (se agrega a
   `clarify.md`), como en la fase 2: un cambio también puede abrir ambigüedades o agujeros.
3. 🔎 `spec.md`. Con el "sí", @planner marca la spec como aprobada.
4. @planner actualiza el plan (`cuco-sdd-plan`) y las tareas (`cuco-sdd-tasks`) en modo
   ACTUALIZAR (sin regenerarlos ni desmarcar nada) → 🔎 `plan.md` y `tasks.md` (con el "sí",
   aprobados en la versión nueva).
5. Sigue con las fases 4 a 10 como en el flujo completo: @tester ajusta los tests de los RF
   afectados, @implementer ejecuta las tareas nuevas en el "Orden de ejecución" (una tarea
   nueva puede ir antes que otras pendientes), revisión, 🔒 seguridad, 📋 cumplimiento y
   cierre. Todo informe anterior al cambio queda sin valor: `cuco-sdd-status` solo cuenta
   las rondas de la versión vigente.
Si el cambio llega a mitad del flujo (ej. una tarea pendiente revela un requisito mal
escrito), es igual: retoma después desde la fase que indique `cuco-sdd-status`.
