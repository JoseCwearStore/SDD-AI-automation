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
    Estado: borrador
    Orden de ejecución: T1, T2
    Base: (la anota el implementer al empezar la primera tarea)

    - [ ] **T1** — Título corto
      - Depende de: Ninguna
      - RF: RF1, RF2
      - Tests en verde al terminar: tests de aceptación NNN-RF1 y NNN-RF2
      - Hecho cuando: criterio verificable (un comando, un test, un comportamiento observable)
      - Comandos con permiso: los que el implementer necesitará y no están en su lista
        permitida (ej. `docker compose build`, `docker pull`), para que el usuario los
        apruebe de antemano. "Ninguno" si no hay.
    - [ ] **T2** — ⚠️ Título corto (requiere aprobación: cambio en el esquema de datos)
      - ...

**Modo ACTUALIZAR** (si `tasks.md` ya existe, tras un cambio de requisitos): no lo
regeneres. Nunca desmarques, borres ni renumeres tareas, y no toques la `Base:`. Los ajustes
van en tareas nuevas con el siguiente número libre; actualiza "Orden de ejecución" (una
tarea nueva puede ir antes que otras pendientes) y vuelve a `Estado: borrador` hasta el
nuevo 🔎.

## Reglas
- Orden: de la capa más interna a la más externa, según la sección "Arquitectura" de
  `AGENTS.md`. Cada tarea declara en "Depende de" las tareas que deben estar hechas antes
  ("Ninguna" si no hay).
- "Orden de ejecución" lista TODAS las tareas en el orden en que se ejecutan, respetando sus
  "Depende de". Es la única fuente del orden: el número de una tarea es solo su nombre. Al
  agregar tareas por un cambio de requisitos no se renumera, y una tarea nueva puede ir antes
  que otras pendientes (ej. `T1, T2, T5, T3, T4`).
- "Estado" lo pasa a `Estado: aprobado (versión Cn)` el planner, solo cuando el coordinador
  le dice que el usuario aprobó (Cn: versión vigente de la spec, ver `cuco-sdd-change`).
  "Base" la anota el implementer: no la toques.
- Tamaño: una tarea = una delegación al implementer, con un diff que el usuario pueda revisar
  en pocos minutos. Si una tarea toca varias capas o varios módulos, probablemente son dos.
- Cada RF de la spec aparece en al menos una tarea, salvo los marcados `[diferido: NNN]`
  (los implementa y prueba la spec NNN). Un RF sin tarea es un plan incompleto. Los RF de
  otras specs marcados `[diferido: <esta spec>]` también necesitan su tarea aquí.
- "Hecho cuando" es verificable: nada de "funciona bien" o "está implementado".
- Marca con ⚠️ las tareas que tocan algo de la sección "Requiere aprobación" del plan. Si
  instalan una dependencia con versión mayor asumida, añade la línea
  `- Puerta de versión: <paquete> <mayor>.x` para que el implementer la compruebe.
- Máximo 10 tareas sin marcar (las ya hechas no cuentan). Si salen más, NO escribas el
  archivo: devuelve BLOQUEADO con una propuesta de cómo dividir la spec (o, en modo
  ACTUALIZAR, el cambio) en dos o más.
