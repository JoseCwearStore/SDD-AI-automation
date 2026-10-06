---
name: cuco-sdd-change
description: SDD · Aplica un cambio de requisitos a una spec existente (primero la spec, después el código), con análisis de impacto. No toca plan, tareas, tests ni código.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

NO toques código, `plan.md` ni `tasks.md`. Lee `docs/constitution.md`, `AGENTS.md` y todo
`specs/NNN-nombre/`. El cambio pedido por el usuario te lo pasa el coordinador.

## 0. ¿Es un cambio o una spec nueva?
Si el cambio añade un módulo nuevo, más de 3 RF, o contradice el objetivo de la spec: NO lo
apliques. Devuelve BLOQUEADO proponiendo una spec nueva.
Si el cambio es ambiguo: devuelve PREGUNTAS (máximo 5).

## 1. Actualiza `spec.md`
- RF nuevo: toma el siguiente número libre. NUNCA renumeres los existentes: los tests de
  aceptación se nombran por su RF.
- RF modificado: conserva su número y actualiza su redacción EARS.
- RF eliminado: no lo borres. Márcalo como `RFn (eliminado): motivo`. Su número no se
  reutiliza.
- Cada RF nuevo o modificado lleva sus criterios Dado / Cuando / Entonces con valores
  concretos. Actualiza "Casos límite" y "Fuera de alcance".
- Cambia el estado a `Estado: borrador`: el cambio necesita una nueva aprobación.

## 2. Análisis de impacto (en tu respuesta, no en archivos)
- **plan.md**: qué secciones habría que cambiar.
- **tasks.md**: tareas nuevas necesarias. Las ya marcadas NO se desmarcan: los ajustes van
  en tareas nuevas.
- **Tests de aceptación**: cuáles hay que modificar o crear (por nombre `NNN-RFn:`).
- **review.md**: si existe, queda invalidado.

## 3. Respuesta
Devuelve el diff de la spec como "Antes / Después" por cada RF tocado, más el análisis de
impacto. El coordinador lo mostrará al usuario y esperará su aprobación.
