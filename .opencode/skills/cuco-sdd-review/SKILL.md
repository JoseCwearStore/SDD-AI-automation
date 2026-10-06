---
name: cuco-sdd-review
description: SDD · Valida la implementación de una spec RF por RF (o un cambio pequeño contra su mini plan), contra la constitución y AGENTS.md, y guarda el veredicto en review.md. Solo escribe ese archivo.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

La seguridad (controles C1–C10) la audita después, como última fase, `cuco-sdd-security`:
aquí no la repitas. Si ves un problema de seguridad evidente, anótalo como "Opcional" con
una referencia al control.

## Constitución: checks automáticos y manuales (vale en los dos modos)
- Ejecuta cada `Verificar [auto]:` de `docs/constitution.md`. Un principio que no se cumple
  es un hallazgo.
- NO ejecutes los `Verificar [manual]:` ni los des por cumplidos: lístalos en "Checks
  manuales" para el usuario.
- Si un `Verificar` no tiene marca, trátalo como `[manual]` y añade un hallazgo "Opcional"
  pidiendo marcarlo.

## Modo feature (cambio pequeño, sin spec)
Si el coordinador te pasa un mini plan aprobado en lugar de una spec: no busques `spec.md`,
`plan.md`, `tasks.md` ni `review.md`, y no escribas `review.md`. Haz solo esto:
1. Compara el diff (`git diff`, `git status`) con el mini plan: un archivo o comportamiento
   fuera del mini plan es un hallazgo.
2. Los checks de la constitución (sección anterior).
3. Comprueba las reglas de "Arquitectura" y "Tests" de `AGENTS.md` sobre los archivos del diff.
Devuelve el VEREDICTO, los hallazgos y los checks manuales en tu respuesta. El resto de esta
skill no aplica.

## Modo spec (flujo SDD completo)
Lee `docs/constitution.md`, `AGENTS.md`, `MEMORY.md` y de `specs/NNN-nombre/`: `spec.md`,
`plan.md`, `tasks.md` y `review.md` (si existe). La ruta te la pasa el coordinador.
Revisa los cambios con `git diff` y `git status`.

## 0. Si existe un `review.md` anterior (ronda 2)
Primero verifica UNO POR UNO los hallazgos de la ronda anterior: resuelto o no resuelto.
Después revisa solo lo que cambió desde entonces. No reabras lo que ya estaba aprobado.

## 1. Tareas
Todas marcadas en `tasks.md` y con su "Hecho cuando" cumplido. Si falta una: hallazgo.

## 2. Requisitos, RF por RF
Ejecuta el comando de tests de la sección "Comandos" de `AGENTS.md`. Si el entorno de tests no
está disponible (ej. la base de datos), devuelve BLOQUEADO: no lo levantes.
Por cada criterio de la spec, comprueba:
- Qué test lo cubre (nombre `NNN-RFn:`) y si pasa.
- Si lo prueba DE VERDAD: los mismos valores de la spec, y asserts sobre el "Entonces"
  (no tests sin asserts, ni `expect(true)`, ni asserts que no dependen del código).
Los RF de interfaz: si tienes una herramienta de navegador disponible, úsala (flujo, consola
y vista móvil). Si no, añádelos a "Checks manuales" con los pasos exactos a comprobar.

## 3. Constitución
Los checks de la sección "Constitución" de arriba.

## 4. Arquitectura y convenciones
Comprueba las reglas de las secciones "Arquitectura" y "Tests" de `AGENTS.md` sobre los
archivos del diff.

## 5. Alcance
Compara el diff con `plan.md`: un archivo o comportamiento que el plan no menciona es un
hallazgo. No hay "mejoras" fuera del plan.

## Qué bloquea y qué no
- **Bloquea** (CAMBIOS NECESARIOS): incumple un RF, una tarea, la constitución o `AGENTS.md`
  (o, en modo feature, se sale del mini plan).
- **No bloquea** ("Opcional"): sugerencias de estilo o mejoras que no incumplen nada.
- Los checks manuales no bloquean tu veredicto, pero el coordinador se los muestra al usuario.

## 6. Guarda el veredicto en `specs/NNN-nombre/review.md`
Si ya existe, agrega una sección nueva `## Ronda N` debajo de la anterior: no borres el
historial.

    ## Ronda 1
    VEREDICTO: APROBADO | CAMBIOS NECESARIOS

    | RF | Criterio | Test | Resultado | ¿Lo prueba de verdad? |
    |----|----------|------|-----------|-----------------------|

    ### Hallazgos que bloquean
    1. `archivo:línea` — qué incumple (RF, tarea, regla o principio) — qué se espera —
       **Responsable**: planner | tester | implementer

    ### Opcional
    - Sugerencias que no bloquean.

    ### Checks manuales (a cargo del usuario)
    - [ ] Principio N / RFn — qué comprobar y cómo.

    ### Ronda anterior (solo en la ronda 2)
    - Hallazgo 1: resuelto | no resuelto

En tu respuesta, la primera línea es el mismo VEREDICTO.
