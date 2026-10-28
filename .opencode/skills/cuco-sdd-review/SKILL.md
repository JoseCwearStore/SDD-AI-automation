---
name: cuco-sdd-review
description: SDD · Valida la implementación de una spec RF por RF (o un cambio pequeño contra su mini plan), contra la constitución y AGENTS.md, y guarda el veredicto en review.md. Solo escribe ese archivo.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

La seguridad (C1–C10, `cuco-sdd-security`) y el cumplimiento (P1–P12 y A1–A8,
`cuco-sdd-privacy` y `cuco-sdd-a11y`) se auditan después, en sus fases: aquí no los repitas. Si ves un problema de seguridad evidente, anótalo como "Opcional" con
una referencia al control.

## Constitución: checks automáticos y manuales (vale en los dos modos)
- Ejecuta cada `Verificar [auto]:` de `docs/constitution.md`. Un principio que no se cumple
  es un hallazgo.
- NO ejecutes los `Verificar [manual]:` ni los des por cumplidos: lístalos en "Checks
  manuales" para el usuario.
- Si un `Verificar` no tiene marca, trátalo como `[manual]` y añade un hallazgo "Opcional"
  pidiendo marcarlo.

## El diff que se revisa (vale en los dos modos)
El usuario puede commitear después de cada tarea: `git diff` a secas no basta. Usa la base
(`Base:` de `tasks.md`, o la que te pasa el coordinador en modo feature):
- `git diff <base>`: todo lo cambiado desde la base, commiteado o no.
- `git status --porcelain -uall`: los archivos nuevos sin seguimiento uno por uno (sin
  `-uall`, una carpeta nueva aparece como una sola línea). Léelos completos: `git diff` no
  los muestra.
- Con `Base: sin commits`, todo el repositorio es nuevo: revisa los archivos de
  `git status --porcelain -uall`.
Si no hay base, devuelve BLOQUEADO pidiéndola: no revises a ciegas.

## Modo feature (cambio pequeño, sin spec)
Si el coordinador te pasa el archivo de una feature (`specs/features/…md`, con su mini plan
aprobado) en lugar de una spec: no busques `spec.md`, `plan.md`, `tasks.md` ni `review.md`.
Haz solo esto:
1. Compara el diff con el mini plan (ver "El diff que se revisa"; la base te la pasa el
   coordinador): un archivo o comportamiento fuera del mini plan es un hallazgo.
2. Los checks de la constitución (sección anterior).
3. Comprueba las reglas de "Arquitectura" y "Tests" de `AGENTS.md` sobre los archivos del diff.
Agrega al final del archivo de la feature `## Revisión · Ronda N · Base <hash>` con el
VEREDICTO, los hallazgos y los checks manuales (mismo formato que `review.md`, sin tocar lo
que hay arriba), y devuélvelos también en tu respuesta. El resto de esta skill no aplica.

## Modo spec (flujo SDD completo)
Lee `docs/constitution.md`, `AGENTS.md`, `MEMORY.md` y de `specs/NNN-nombre/`: `spec.md`,
`plan.md`, `tasks.md` y `review.md` (si existe). La ruta te la pasa el coordinador.
Revisa los cambios desde la `Base:` de `tasks.md` (ver "El diff que se revisa").

## 0. Si existe un `review.md` anterior (ronda 2 o más)
Primero verifica UNO POR UNO los hallazgos de la ronda anterior: resuelto o no resuelto.
Después revisa solo lo que cambió desde entonces. No reabras lo que ya estaba aprobado.
Excepción: si la última ronda es de una versión anterior de la spec (hubo un cambio de
requisitos), revisa todo de nuevo contra la versión vigente.

## 1. Tareas
Todas marcadas en `tasks.md` y con su "Hecho cuando" cumplido. Si falta una: hallazgo.
Cada `⚠️ Verificación delegada: … → reviewer` la compruebas tú (si no puedes, es hallazgo);
cada `→ usuario` va a "Checks manuales". Un criterio sin verificar en una tarea marcada sin
esa línea es un hallazgo.

## 2. Requisitos, RF por RF
Ejecuta el comando de tests de la sección "Comandos" de `AGENTS.md`. Si el entorno de tests no
está disponible (ej. la base de datos), devuelve BLOQUEADO: no lo levantes.
Por cada criterio de la spec, comprueba:
- Qué test lo cubre (nombre `NNN-RFn:`) y si pasa.
- Si lo prueba DE VERDAD: los mismos valores de la spec, y asserts sobre el "Entonces"
  (no tests sin asserts, ni `expect(true)`, ni asserts que no dependen del código).
- Los `[manual]` van a "Checks manuales" con sus pasos; los `[diferido: NNN]` se anotan como
  "Diferido a NNN" (no son hallazgo). Los de otras specs `[diferido: <esta spec>]` se
  revisan aquí como uno más.
Los RF de interfaz: si tienes una herramienta de navegador disponible, úsala (flujo, consola
y vista móvil). Si no, añádelos a "Checks manuales" con los pasos exactos a comprobar.

## 3. Constitución
Los checks de la sección "Constitución" de arriba.

## 4. Arquitectura y convenciones
Comprueba las reglas de las secciones "Arquitectura" y "Tests" de `AGENTS.md` sobre los
archivos del diff. Los tests que tocan recursos externos respetan el "Aislamiento" del plan
(configuración propia, sin caer en la de desarrollo, fallan en vez de saltearse) y validan
el destino efectivo con la misma librería que el cliente (sin parámetros que lo cambien).
Si hay pantallas: ningún color, fuente, tamaño de letra o espaciado literal fuera del
archivo de tokens del sistema de diseño (`cuco-sdd-design`).

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
historial. Cada ronda dice qué versión de la spec cubre (C0 si no tiene `## Cambios`).

    ## Ronda 1 · versión C0
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

    ### Ronda anterior (solo desde la ronda 2)
    - Hallazgo 1: resuelto | no resuelto

En tu respuesta, la primera línea es el mismo VEREDICTO.
