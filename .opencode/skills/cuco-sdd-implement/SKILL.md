---
name: cuco-sdd-implement
description: SDD · Implementa UNA tarea de tasks.md con TDD (rojo, verde, refactor), sin tocar los tests de aceptación ni ir más allá de la tarea.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

La spec y la tarea (ej. `specs/NNN-nombre/`, `T3`) te las pasa el coordinador.

## 0. Antes de empezar
- Lee `docs/constitution.md`, `AGENTS.md`, `MEMORY.md`, y de la spec: `spec.md`, `plan.md`,
  `tasks.md` y los tests de aceptación de los RF de tu tarea.
- Carga `cuco-sdd-security` en modo GUÍA y aplica la sección "Seguridad" de `plan.md` a lo
  que toca tu tarea (validación en el borde, auth, errores, logs, secretos).
- Comprueba que las tareas anteriores están marcadas como hechas. Si no: PARA y devuelve
  BLOQUEADO.

## 1. Rojo
Escribe los tests unitarios de la lógica nueva (ver la sección "Tests" de `AGENTS.md`).
Ejecútalos y comprueba que fallan por la razón correcta: falta implementación, no un error de
sintaxis o de import.

## 2. Verde
Escribe el código MÍNIMO para que pasen tus tests unitarios y los tests de aceptación que la
tarea indica en "Tests en verde al terminar". Sigue `plan.md` y la arquitectura de `AGENTS.md`.

## 3. Refactor
Mejora nombres y elimina duplicación con los tests en verde. No cambies comportamiento.

## 4. Verificar
Ejecuta los comandos de la sección "Comandos" de `AGENTS.md`: tests, verificación de
arquitectura y verificación de tipos (los que el proyecto defina). La tarea está hecha cuando:
- pasan los tests de "Tests en verde al terminar",
- sigue en verde todo lo que ya lo estaba,
- las verificaciones de arquitectura y de tipos no reportan errores, y
- se cumple el "Hecho cuando" de la tarea.

## 5. Cerrar
Marca la tarea como hecha en `tasks.md` SOLO si verificaste TODOS sus criterios de "Hecho
cuando". Si alguno no se pudo verificar (ej. falta un permiso o el entorno), NO la marques:
déjala sin marcar con una línea `⚠️ Pendiente de verificación: <criterio> — <por qué>` y
devuelve PREGUNTAS. En tu respuesta, propone un mensaje de commit convencional para la tarea
(el commit lo hace el usuario). PARA: no empieces la siguiente.

## Reglas
- Solo la tarea indicada. Si necesitas tocar algo que el plan no menciona, PARA y devuelve
  PREGUNTAS: no lo resuelvas por tu cuenta. Tampoco adelantes trabajo anotado para otra
  spec, aunque sea pequeño.
- Si necesitas un comando que no está en tu lista permitida ni en "Comandos con permiso" de
  la tarea, explica para qué antes de pedirlo. Nunca renombres carpetas.
- Si la tarea está marcada con ⚠️, el cambio necesita la aprobación del usuario: si se
  deniega, devuelve BLOQUEADO.
- Si un test de aceptación parece incorrecto, NO lo toques: devuelve BLOQUEADO explicando
  por qué.
