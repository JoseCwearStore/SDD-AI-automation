---
name: cuco-sdd-flow-bootstrap
description: SDD · Flujo del coordinador para /sdd-bootstrap - inventario, aviso de arquitectura, entrevista con el planner, visión, AGENTS.md, MEMORY.md y constitución, cada uno con su 🔎. Solo la carga el coordinador.
---
Esta skill es para el coordinador. Las reglas de transparencia, 🔎, contexto y contrato de
respuesta de tu definición valen en cada paso. No hace falta la "Verificación previa": este
flujo crea lo que ella comprueba.

1. **Inventario.** Comprueba leyendo cuáles existen: `AGENTS.md`, `MEMORY.md`,
   `docs/constitution.md` y `specs/000-vision/`. Díselo al usuario: "Se generan de cero: …
   · Ya existen (solo se revisan, no se pisan): …". Pásale el inventario a @planner.
2. **Arquitectura por defecto.** Avisa al usuario ANTES de empezar: "Por defecto este SDD
   usa **arquitectura hexagonal (puertos y adaptadores) en backend y frontend**, organizada
   por módulo. Si prefieres otra (MVC, capas…), dímelo en cualquier momento."
3. @planner con `cuco-sdd-bootstrap`. Si devuelve PREGUNTAS, házselas al usuario de una en
   una y vuelve a llamarle con las respuestas. Repite hasta que devuelva OK.
4. En GREENFIELD: 🔎 `specs/000-vision/vision.md` y `specs/000-vision/roadmap.md`. Con el
   "sí", @planner marca la visión como aprobada.
5. 🔎 `AGENTS.md` y `MEMORY.md` (los que se generaron; si ya existían, muestra el diff que
   propone @planner y, con el "sí", pídele que lo aplique).
6. @planner con `cuco-sdd-constitution`. 🔎 `docs/constitution.md` (o el diff, si ya existía).
7. **Cierre.** Explica al usuario los caminos para trabajar desde ahora:
   - `/sdd <petición>`: flujo completo (spec → plan → tests → código → revisión →
     seguridad → cumplimiento), para funcionalidades nuevas o cambios que no son pequeños.
   - `/sdd-feature <petición>`: flujo liviano para cambios pequeños.
   - `/sdd-continue <NNN>`: retomar una spec que ya existe desde la fase en que quedó.
   - `/sdd-design`: sistema de diseño (paleta y tipografía), obligatorio antes de la
     primera spec con pantallas; acepta referencias en `docs/design/references/`.
   - `/sdd-release`: cuando el producto esté listo, borradores legales y revisión final.
   El siguiente paso recomendado es la primera spec del roadmap: `/sdd-continue <NNN>` si ya
   existe en `specs/`, o `/sdd <objetivo de esa spec>` si todavía no existe.
