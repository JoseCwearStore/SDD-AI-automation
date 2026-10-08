---
name: cuco-sdd-plan
description: SDD · Genera el plan técnico de una spec aprobada, organizado por módulo y capa según la arquitectura de AGENTS.md, con trazabilidad RF por RF.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

Lee `docs/constitution.md`, `AGENTS.md`, `MEMORY.md` y `specs/NNN-nombre/spec.md` (la ruta te
la pasa el coordinador). NO escribas código.

Si la spec no tiene "Estado: aprobada" o tiene dudas abiertas: PARA y devuelve BLOQUEADO.

Genera `specs/NNN-nombre/plan.md` con estas secciones:

## 1. Módulos afectados
Revisa los módulos existentes en el código y la sección "Arquitectura" de `AGENTS.md`.
Indica cuáles se tocan y por qué.
Si el cambio necesita un módulo NUEVO: indícalo en "⚠️ Requiere aprobación" con su nombre,
su responsabilidad y por qué no encaja en uno existente. Los nombres siguen las convenciones
de `AGENTS.md`.

## 2. Diseño por capa
Sigue la arquitectura definida en la sección "Arquitectura" de `AGENTS.md`. Por cada módulo
afectado y por cada capa definida allí, indica qué se crea o modifica y su responsabilidad.
Incluye siempre:
- Los puertos o interfaces nuevos y qué los implementa (también los fakes para tests).
- Si el proyecto tiene interfaz: páginas, componentes, hooks y clientes, con estados de
  carga, error y vacío.
Cada elemento con su nombre concreto y la ruta del archivo donde vivirá, siguiendo el árbol
de "Arquitectura" de `AGENTS.md` (forma: `<CasoDeUso>` en
`<raíz>/<módulo>/application/<caso-de-uso>.<ext>`): el tester los importará antes de que
existan.

## 3. Lógica no trivial
Pseudocódigo SOLO para algoritmos o máquinas de estado (ej. un ranking, transiciones de
estado). La hora sale siempre del reloj que define `AGENTS.md`, nunca de la hora real.

## 4. Contrato del borde
Si el cambio expone o modifica una API, CLI o evento: por cada uno, entrada (ej. método y ruta
exacta), salida y errores (cómo se traduce cada error de dominio, ej. a un código HTTP).
Si no aplica, escribe "No aplica".

## 5. ⚠️ Requiere aprobación
Cambios en el esquema de datos o en las migraciones, dependencias nuevas y módulos nuevos,
cada uno con su porqué. Si no hay, escribe "Ninguno".

## 6. Decisiones
Cada una con: qué se decidió, la alternativa descartada y por qué se descartó.

## 7. Estrategia de tests
Unitarios, integración y aceptación, según la sección "Tests" de `AGENTS.md`, indicando qué
criterios de la spec cubre cada uno.
**Aislamiento**: por cada recurso externo que usen los tests (base de datos, almacenamiento,
colas, correo), su configuración de test propia, que nunca cae en la de desarrollo, y su
validación (nombre de test + host permitido de una lista explícita). Si no es válida, los
tests que la usan FALLAN con un mensaje claro: nunca se saltean.

## 8. Trazabilidad
| RF | Capa / componente | Tipo de test |
|----|-------------------|--------------|
Todos los RF de la spec deben aparecer. Un RF sin fila es un plan incompleto.

## 9. Seguridad
Con `cuco-sdd-security` en modo GUÍA y la sección "Seguridad" de `AGENTS.md`:
- **Rutas públicas**: la lista explícita. Todo lo que no esté aquí exige autenticación.
- **C1–C10**: una línea por control: "Aplica: cómo (componente y archivo)" o "No aplica:
  por qué". Tablas nuevas → C3 con ENABLE + FORCE + políticas en su migración.
- Librerías nuevas que hagan falta (limitador, logger, validación) → también en
  "⚠️ Requiere aprobación".
La auditoría final de seguridad comprueba el código contra esta sección.

## 10. Cumplimiento
Con `cuco-sdd-privacy` y `cuco-sdd-a11y` en modo GUÍA y la sección "Cumplimiento" de
`AGENTS.md`: una línea por cada control que toca la spec (P1–P12, A1–A8): "Aplica: cómo" o
"No aplica: por qué". Servicios o SDKs nuevos, con los datos que reciben, y herramientas de
accesibilidad para tests → también en "⚠️ Requiere aprobación".

## 11. Diseño (solo si hay pantallas)
Con `cuco-sdd-design` en modo GUÍA: qué tokens y componentes usa cada pantalla, y su
referencia visual si existe. En la primera spec con pantallas, incluye la tarea que crea
los tokens en código desde `docs/design/design-system.md` y el test de sus pares de
contraste. Si no hay pantallas: "No aplica".

## Reglas
- Todo respeta la dirección de dependencias de la sección "Arquitectura" de `AGENTS.md`.
- No añadas nada que la spec no pida: si algo parece necesario y no está en la spec,
  anótalo en "Dudas o decisiones" de tu respuesta, no en el plan.
