---
name: cuco-sdd-flow-release
description: SDD · Flujo del coordinador para /sdd-release - estado de todas las specs, borradores legales, revisión de producto y lista final de lo que es del usuario. Solo la carga el coordinador.
---
Esta skill es para el coordinador. Las reglas de transparencia, 🔎, contexto y contrato de
respuesta de tu definición valen en cada paso. Revisión del producto completo antes de
publicarlo: no sustituye a la revisión legal.

1. **Verificación previa** y, además, carga `cuco-sdd-status` para todas las specs: si
   alguna del roadmap no está cerrada (o hay features sin cerrar), muéstralo y pregunta al
   usuario si sigue igual. PARA.
2. Avisa al usuario: "Los documentos legales que se generan son BORRADORES hechos por IA a
   partir del código. Un profesional de tu jurisdicción debe revisarlos antes de publicarlos."
3. @planner con `cuco-sdd-privacy` en modo RELEASE: genera o actualiza los borradores de
   `docs/legal/`. 🔎 cada documento, con su checklist "👤 Te corresponde a ti".
4. @reviewer con `cuco-sdd-privacy` (modo RELEASE) y `cuco-sdd-a11y` (modo AUDITORÍA sobre
   todas las pantallas): escribe `docs/release/release.md`.
   - Hallazgos de código o de una funcionalidad que falta (ej. borrar la cuenta): explícalos y
     recomienda `/sdd` o `/sdd-feature` para cada uno. No los implementes desde aquí.
5. **Lista final para el usuario**: todos los ítems 👤 y los checks manuales acumulados, y
   los documentos que siguen con el encabezado "⚠️ BORRADOR". Dilo sin rodeos: **el producto
   no está listo para publicar** mientras quede alguno; solo el usuario quita ese
   encabezado, tras la revisión legal.
