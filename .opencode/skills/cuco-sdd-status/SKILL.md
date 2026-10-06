---
name: cuco-sdd-status
description: SDD · Informa en qué fase está una spec (o todas) y cuál es el siguiente paso exacto, deduciéndolo de los archivos. Solo lectura.
---
No modifiques ningún archivo. Lee `MEMORY.md` y la carpeta de la spec que te indiquen
(`specs/NNN-nombre/`). Si no te indican ninguna, revisa todas las de `specs/`.

## Cómo deducir la fase (de la primera que NO se cumple)
1. Existe `spec.md` → si no: sin spec.
2. `spec.md` tiene "Estado: aprobada" → si no: fase 1-2 (spec en borrador, pendiente de
   revisión o de aprobación del usuario).
3. Existen `plan.md` y `tasks.md` → si no: fase 3 (plan y tareas).
4. Existen tests de aceptación con nombre `NNN-RFn:` (NNN = número de ESTA spec) para todos
   los RF no eliminados de la spec (busca en las carpetas `acceptance/` que define
   `AGENTS.md`) → si no: fase 4 (tests).
5. Todas las tareas de `tasks.md` están marcadas → si no: fase 5 (siguiente tarea pendiente).
6. Existe `review.md` con `VEREDICTO: APROBADO` → si no: fase 6-7 (revisión o correcciones;
   si hay `review.md` con CAMBIOS NECESARIOS, indica cuántos hallazgos quedan).
7. `MEMORY.md` menciona el cierre de esta spec → si no: fase 8 (cierre pendiente).
Si se cumplen todas: spec cerrada.

## Respuesta (máximo 8 líneas por spec)
- Spec y fase actual.
- Tareas: x de y hechas.
- Siguiente paso exacto: quién actúa (usuario, planner, tester, implementer o reviewer) y qué.
  Si el siguiente paso es una aprobación del usuario, dilo explícitamente.
- Inconsistencias: si los archivos se contradicen (ej. tareas marcadas sin tests de
  aceptación), indícalo.