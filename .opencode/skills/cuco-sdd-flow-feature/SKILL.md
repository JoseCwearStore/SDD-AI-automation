---
name: cuco-sdd-flow-feature
description: SDD · Flujo del coordinador para /sdd-feature - mini plan, implementación con TDD, revisión, seguridad y cumplimiento, todo guardado en specs/features/. Solo la carga el coordinador.
---
Esta skill es para el coordinador. Las reglas de transparencia, 🔎, contexto y contrato de
respuesta de tu definición valen en cada paso. Antes de empezar, haz tu "Verificación
previa".

Todo el cambio vive en un archivo, `specs/features/AAAA-MM-DD-nombre.md` (fecha de hoy y
2 a 4 palabras en kebab-case): el mini plan aprobado y las rondas de revisión, seguridad y
cumplimiento. Así un cambio pequeño también se puede retomar en otra sesión.

1. @implementer con `cuco-sdd-feature`, fase PROPONER. Si devuelve BLOQUEADO por no ser
   pequeño, explícale al usuario por qué y recomienda `/sdd`.
2. Muestra el mini plan. Las dudas, de una en una. 🔎 mini plan. Con el "sí", @planner con
   `cuco-sdd-feature` (sección "Archivo de la feature") lo guarda en
   `specs/features/AAAA-MM-DD-nombre.md` con `Estado: aprobado`. Si el usuario pidió
   cambios, pásale el mini plan ya corregido.
3. @implementer con `cuco-sdd-feature`, fase EJECUTAR, pasándole la ruta del archivo de la
   feature. Anota la `Base:` que informa: la necesitan la revisión y las auditorías.
4. @reviewer con `cuco-sdd-review`, en modo feature: le pasas la ruta del archivo de la
   feature y la `Base:`. Agrega su ronda al archivo.
5. 🔒 @reviewer con `cuco-sdd-security` en modo AUDITORÍA, sobre el diff y el mini plan.
   Agrega su ronda al archivo. Si hay hallazgos, @implementer los corrige y se repite la
   revisión (máximo 2 vueltas, como en el flujo completo).
6. 📋 @reviewer con `cuco-sdd-privacy` y `cuco-sdd-a11y` en modo AUDITORÍA, sobre el diff.
   Agrega su ronda al archivo. Mismas reglas de corrección.
7. @implementer actualiza `MEMORY.md` con una línea: el cambio, su porqué y la ruta del
   archivo de la feature. Que incluya en su respuesta el diff contra la `Base:`
   (`git diff --stat <base>` y `git status --porcelain -uall`).
8. 🔎 ese diff. Con el "sí", @planner cambia la feature a `Estado: cerrada`. Resume
   (incluidos los checks manuales y los ítems 👤) y propón un mensaje de commit
   convencional. El commit lo hace el usuario.

Para retomar una feature a medias, lee su archivo: la última sección escrita dice en qué
paso quedó (la `Base:` está en la primera ronda del reviewer; si todavía no hay ninguna,
pídesela a @implementer con `git log`).
