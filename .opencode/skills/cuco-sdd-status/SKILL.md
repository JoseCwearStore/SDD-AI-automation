---
name: cuco-sdd-status
description: SDD · Informa en qué fase está una spec (o todas) y cuál es el siguiente paso exacto, deduciéndolo de los archivos. Solo lectura.
---
No modifiques ningún archivo. Lee `MEMORY.md` y la carpeta de la spec que te indiquen
(`specs/NNN-nombre/`). Si no te indican ninguna, revisa todas las de `specs/`.

`specs/000-vision/` no es una spec: no la cuentes (solo informa si la visión no está
aprobada). `specs/features/` tampoco: lista aparte cada feature sin `Estado: cerrada`, con
la última sección escrita (mini plan, Revisión, Seguridad o Cumplimiento) y su veredicto,
como "Features abiertas".

## Antes de deducir
- **Versión vigente** de la spec: el último `Cn` de su sección `## Cambios`, o C0 si no la
  tiene. Una ronda o una aprobación solo cuenta si dice esa versión: las de versiones
  anteriores quedaron invalidadas por un cambio de requisitos. Una ronda o aprobación sin
  versión (archivos de antes de esta convención) cuenta como C0.
- **RF que exigen test**: los RF no eliminados de la spec, menos los criterios `[manual]` y
  los RF `[diferido: NNN]`, más los RF de otras specs marcados `[diferido: <esta spec>]`
  (búscalos en todas las `spec.md`).

## Cómo deducir la fase (de la primera que NO se cumple)
1. Existe `spec.md` → si no: sin spec.
2. `spec.md` tiene "Estado: aprobada" o "Estado: cerrada" → si no: fase 1-2 (spec en
   borrador, pendiente de revisión o de aprobación del usuario). Si existe `clarify.md`,
   indica el veredicto de su última ronda, su versión y cuántos hallazgos siguen abiertos
   (y de quién: planner o usuario).
3. `plan.md` y `tasks.md` tienen `Estado: aprobado (versión <vigente>)` → si no: fase 3
   (plan y tareas por generar, por actualizar tras un cambio o pendientes del 🔎 del usuario).
4. Existen tests de aceptación cuyo archivo contiene el texto `<spec>-RFn:` (en el nombre o
   la descripción del test, según el lenguaje) para todos los RF que exigen test
   (busca en las carpetas `acceptance/` que define `AGENTS.md`) y, si la versión vigente no es
   C0, la última ronda de `tests.md` es de esa versión → si no: fase 4 (tests). Si existe
   `tests.md`, indica los tests que quedaron sin poder ejecutarse y por qué.
5. Todas las tareas de `tasks.md` están marcadas → si no: fase 5. La siguiente tarea es la
   primera sin marcar de "Orden de ejecución" (no la de número más bajo). Si tiene
   `⚠️ Pendiente de verificación`, el siguiente paso es resolver eso.
6. La última ronda de `review.md` es de la versión vigente y dice `VEREDICTO: APROBADO` → si
   no: fase 6-7 (revisión o correcciones; si dice CAMBIOS NECESARIOS, indica cuántos
   hallazgos quedan).
7. Lo mismo con `security.md` y `VEREDICTO: SEGURO` → si no: fase 8 (auditoría pendiente, o
   hallazgos por corregir: indica cuántos y de quién).
8. Lo mismo con `compliance.md` y `VEREDICTO: CUMPLE` → si no: fase 9 (auditoría pendiente,
   o hallazgos por corregir).
9. `spec.md` tiene "Estado: cerrada" → si no: fase 10 (cierre pendiente).
Si se cumplen todas: spec cerrada. Indica además sus RF `[diferido: NNN]` y en qué spec
quedan pendientes.
Si una spec con "Estado: cerrada" no cumple alguno de los puntos 3-8, es una inconsistencia:
indícala.

## Respuesta (máximo 8 líneas por spec)
- Spec y fase actual.
- Tareas: x de y hechas.
- Siguiente paso exacto: quién actúa (usuario, planner, tester, implementer o reviewer) y qué.
  Si el siguiente paso es una aprobación del usuario, dilo explícitamente.
- Comando para seguir: `/sdd-continue NNN`.
- Inconsistencias: si los archivos se contradicen (ej. tareas marcadas sin tests de
  aceptación), indícalo.