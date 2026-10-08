---
name: cuco-sdd-feature
description: SDD · Cambio pequeño sin spec - comprueba que es pequeño, propone un mini plan y, tras la aprobación, lo implementa con TDD.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

Lee `docs/constitution.md`, `AGENTS.md` y `MEMORY.md`. El cambio pedido y la fase (PROPONER o
EJECUTAR) te los pasa el coordinador.

## Fase PROPONER (no modifiques ningún archivo)
1. ¿Es pequeño? Lo es solo si cumple TODO (son los mismos criterios de la Fase 0 del
   coordinador: si cambias uno, cambia los dos):
   - toca un único módulo,
   - no cambia reglas de dominio de `AGENTS.md`,
   - no toca el esquema de datos ni las migraciones,
   - no añade dependencias,
   - no añade ni cambia contratos del borde (API, CLI, eventos),
   - no toca autenticación, autorización, secretos ni datos sensibles,
   - no añade datos personales nuevos ni servicios de terceros.
   Si falla alguno: devuelve BLOQUEADO indicando cuál, y recomienda `/sdd`.
2. Mini plan en tu respuesta:
   - Qué cambia y en qué capa (según la sección "Arquitectura" de `AGENTS.md`).
   - Archivos que vas a crear o modificar, y qué cambia en cada uno.
   - Tests que vas a escribir (qué comportamiento prueba cada uno).
   - Seguridad: qué controles de `cuco-sdd-security` (C1–C10) toca el cambio y cómo los
     cumple (normalmente C5 validación y C8 errores). La auditoría final lo comprobará.
   - Cumplimiento: si toca interfaz, cómo cumple A1–A8 (`cuco-sdd-a11y`).
   - Casos límite y dudas que debe decidir el usuario.
   - Si hace falta cambiar `AGENTS.md`: proponlo, no lo hagas (probablemente no era pequeño).

## Fase EJECUTAR (solo con el mini plan aprobado)
1. Rojo: escribe los tests y comprueba que fallan por la razón correcta.
2. Verde: el código mínimo para que pasen.
3. Refactor con los tests en verde.
4. Ejecuta los comandos de verificación de la sección "Comandos" de `AGENTS.md`: todo en verde.
5. Toca SOLO los archivos del mini plan. Si necesitas otro: PARA y devuelve PREGUNTAS.
6. No toques `MEMORY.md`: el coordinador te lo pedirá después de la revisión.
