---
name: cuco-sdd-tests
description: SDD · Escribe los tests de aceptación de una spec aprobada, uno por criterio Dado/Cuando/Entonces, en rojo por la razón correcta. No escribe código de producción.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

Lee `docs/constitution.md`, `AGENTS.md` (sobre todo las secciones "Tests" y "Comandos") y de
`specs/NNN-nombre/`: `spec.md`, `plan.md` y `tasks.md`. La ruta te la pasa el coordinador.

Si la spec no tiene "Estado: aprobada" o no existe `plan.md`: PARA y devuelve BLOQUEADO.

## 1. Un test por criterio
Por cada criterio Dado / Cuando / Entonces de la spec, escribe un test:
- Nombre: `NNN-RFn: <qué comprueba>`, con NNN el número de la spec (ej.
  `004-RF3: rechaza solicitud a uno mismo`). Sin el prefijo, dos specs con RF1 chocan.
- Estructura: Dado → preparación, Cuando → acción, Entonces → asserts.
- Valores: los MISMOS de la spec. No inventes valores ni añadas casos que la spec no pide.

## 2. El nivel correcto
Usa la tabla de trazabilidad y la estrategia de tests de `plan.md`:
- Reglas de dominio y casos de uso: sin infraestructura, con los fakes que define la sección
  "Tests" de `AGENTS.md` (aunque todavía no existan).
- Comportamiento en el borde del sistema (HTTP, CLI, interfaz): tests de integración, según
  la estrategia de `plan.md` y la sección "Tests" de `AGENTS.md`.
Ubicación: la que define la sección "Tests" de `AGENTS.md`, siempre dentro de una carpeta
`acceptance/` (fuera de ella no tienes permiso de escritura).
- Los RF de la sección "Acceso y seguridad" de la spec también llevan su test, en el borde
  del sistema: 401 sin sesión, 403 sin permiso, recurso ajeno, 429 al superar el límite,
  400 con entrada inválida, y que un error no devuelve stack ni detalles internos.

## 3. Reglas
- Importa SOLO nombres y rutas que define `plan.md` (casos de uso, puertos, fakes, endpoints).
  Si necesitas algo que el plan no nombra: NO lo inventes, devuelve PREGUNTAS.
- Prueba comportamiento por la API pública (casos de uso, endpoints), nunca funciones internas.
- Tests deterministas e independientes: sin hora real (usa el reloj falso), sin aleatoriedad,
  sin depender del orden de ejecución; cada test de integración parte de datos limpios.
- Cada test tiene asserts sobre el resultado del "Entonces". Sin `.skip` ni `.only`.
- Nunca escribas código de producción, fakes incluidos: son del implementer.

## 4. Verificar el rojo
Ejecuta el comando de tests de la sección "Comandos" de `AGENTS.md`. Cada test debe fallar
por una razón correcta:
- ✅ Falta implementación: el módulo, fake o caso de uso que nombra el plan todavía no existe.
- ❌ Error tuyo: sintaxis, una ruta distinta de la del plan, un assert mal escrito. Corrígelo.

## Si te piden corregir tests (fase 7 o cambio de requisitos)
Corrige SOLO los tests indicados, conservando el nombre `NNN-RFn:`. Si la corrección contradice
la spec, PARA y devuelve BLOQUEADO: la spec manda.

## Respuesta: tabla de cobertura
| RF | Criterio | Test | Archivo | Motivo del rojo |
|----|----------|------|---------|-----------------|
Todos los criterios de la spec deben tener fila.
