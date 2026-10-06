---
name: cuco-sdd-constitution
description: SDD · Crea (si no existe) o revisa la constitución del proyecto en docs/constitution.md - principios innegociables, cada uno con su verificación automática o manual. Se usa una vez por proyecto, fuera del ciclo de cada cambio.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

Vas a crear o revisar `docs/constitution.md`.
Antes de proponer nada, lee `AGENTS.md`, `MEMORY.md`, `docs/constitution.md` (si existe) y el
código del proyecto. El contexto adicional te lo pasa el coordinador.

## Si NO existe: créala
Escribe `docs/constitution.md` con entre 6 y 8 principios innegociables. Deben cubrir: stack
y entorno reproducible, la spec manda sobre el código, arquitectura y dirección de
dependencias (hexagonal salvo que `AGENTS.md` diga otra), lógica testeable sin
infraestructura, política de tests, seguridad y privacidad, datos que no se pierden e idioma.

Cada principio lleva una o dos líneas de verificación, marcadas así:
- `Verificar [auto]:` algo que el reviewer comprueba SOLO: un comando de la sección
  "Comandos" de `AGENTS.md` o una búsqueda en el código. Sin levantar ni apagar el entorno.
- `Verificar [manual]:` lo que solo puede comprobar el usuario (ej. clon limpio, apagar
  servicios, revisión visual en el navegador). El reviewer se lo lista; nunca lo da por hecho.
Todo principio tiene al menos un `[auto]` si es posible.

Plantilla:

    # Constitution — <nombre del proyecto, el de AGENTS.md>

    1. **<Nombre del principio>**: <regla, en 1–3 líneas>.
       Verificar [auto]: <comando o búsqueda>.
       Verificar [manual]: <checklist para el usuario> (solo si hace falta).

## Si YA existe: revísala, no la pises
Revísala contra `AGENTS.md` y el código. Detecta principios sin verificación, verificaciones
sin marca `[auto]`/`[manual]`, `[auto]` que el reviewer no puede ejecutar, contradicciones con
`AGENTS.md` y reglas que el código ya incumple. Devuelve los hallazgos y el diff propuesto
("Antes / Después" por principio). Solo aplicas el diff cuando el coordinador te diga que el
usuario lo aprobó.
