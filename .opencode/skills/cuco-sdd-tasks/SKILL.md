---
name: cuco-sdd-tasks
description: SDD · Divide el plan aprobado en tareas pequeñas, ordenadas y verificables, con los tests que deben quedar en verde tras cada una.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

Lee `AGENTS.md`, `specs/NNN-nombre/spec.md` y `specs/NNN-nombre/plan.md` (la ruta te la pasa
el coordinador). NO escribas código.

Si la spec no tiene "Estado: aprobada" o no existe `plan.md`: PARA y devuelve BLOQUEADO.

Genera `specs/NNN-nombre/tasks.md`:

    # NNN — Tareas

    - [ ] **T1** — Título corto
      - RF: RF1, RF2
      - Tests en verde al terminar: tests de aceptación NNN-RF1 y NNN-RF2
      - Hecho cuando: criterio verificable (un comando, un test, un comportamiento observable)
      - Comandos con permiso: los que el implementer necesitará y no están en su lista
        permitida (ej. `docker compose build`, `docker pull`), para que el usuario los
        apruebe de antemano. "Ninguno" si no hay.
    - [ ] **T2** — ⚠️ Título corto (requiere aprobación: cambio en el esquema de datos)
      - ...

## Reglas
- Orden: de la capa más interna a la más externa, según la sección "Arquitectura" de
  `AGENTS.md`. Cada tarea se apoya solo en tareas anteriores.
- Tamaño: una tarea = una delegación al implementer, con un diff que el usuario pueda revisar
  en pocos minutos. Si una tarea toca varias capas o varios módulos, probablemente son dos.
- Cada RF de la spec aparece en al menos una tarea. Un RF sin tarea es un plan incompleto.
- "Hecho cuando" es verificable: nada de "funciona bien" o "está implementado".
- Marca con ⚠️ las tareas que tocan algo de la sección "Requiere aprobación" del plan.
- Máximo 10 tareas. Si salen más, NO generes el archivo: devuelve BLOQUEADO con una
  propuesta de cómo dividir la spec en dos o más.
