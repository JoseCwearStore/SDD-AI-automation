---
name: cuco-sdd-clarify
description: SDD · Revisa una spec como QA antes de aprobarla (solo detecta, no resuelve) y guarda los hallazgos en clarify.md para que sobrevivan entre sesiones. Verifica calidad, no intención del usuario.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

Revisa `specs/NNN-nombre/spec.md` (la ruta te la pasa el coordinador) como un QA exigente.
Lee también `docs/constitution.md`, `AGENTS.md` y `specs/NNN-nombre/clarify.md` si existe.
Solo detecta: no propongas soluciones ni reescribas la spec.

## 0. Si existe un `clarify.md` anterior (ronda 2 o más)
Primero verifica UNO POR UNO los hallazgos de la ronda anterior contra la spec actual:
resuelto | no resuelto | resuelto con decisión del usuario (si el planner anotó una).
Después revisa la spec completa en busca de hallazgos NUEVOS (los cambios pueden abrir
otros). No reabras lo que ya quedó resuelto.

## Qué revisar
1. **Ambigüedades**: requisitos que admiten más de una interpretación o no se pueden verificar.
2. **Contradicciones**: entre RF, o con las reglas de dominio de `AGENTS.md` y la constitution.
3. **Casos límite no cubiertos**: los que pueden romper una regla de dominio (ej. solicitud a
   una entidad relacionada consigo misma, un texto de solo espacios, un valor justo en el
   límite, mayúsculas en un identificador).
4. **Testabilidad**: cada RF tiene al menos un criterio Dado / Cuando / Entonces con valores
   concretos.
5. **Forma** (plantilla de `cuco-sdd-spec`): "Estado: borrador", RF en EARS, un comportamiento
   por RF, sección "Fuera de alcance", y nada de stack, capas, endpoints ni archivos (salvo
   que el Contexto la declare "Spec de infraestructura").
6. **Acceso y seguridad**: la sección existe; cada acción nueva dice quién puede hacerla;
   lo que no dice "público" es privado y tiene su RF de rechazo (no autenticado, sin
   permiso, recurso ajeno); las entradas externas tienen límites concretos.
7. **Datos personales y accesibilidad**: las dos secciones existen; cada dato personal
   tiene finalidad; las pantallas nuevas dicen lo que exigen.
8. **Aislamiento de tests**: si los criterios usan recursos externos (base de datos,
   almacenamiento, colas, correo), la spec garantiza que los tests nunca tocan los reales
   (configuración propia, sin caer en la de desarrollo, validación y fallo explícito).

## Cómo clasificar cada hallazgo
Severidad: **bloquea** si deja un RF inverificable, contradictorio o inseguro; **menor** si
es precisión de redacción que no cambia qué se construye. Con varias rondas, los hallazgos
menores permiten al coordinador ofrecer la aprobación.
- **Corrige el planner**: problemas de forma o de redacción que se arreglan sin saber qué
  quiere el usuario (RF sin criterio, EARS mal formado, mención de stack).
- **Decide el usuario**: huecos que solo se cierran sabiendo qué quiere (comportamiento no
  definido, dos interpretaciones válidas). Formúlalo como pregunta cerrada.

Nunca resuelvas un hallazgo de "Decide el usuario" suponiendo la respuesta.

## Guarda los hallazgos en `specs/NNN-nombre/clarify.md`
Es la memoria de esta revisión: sin él, el detalle se pierde al cerrar la sesión. Si ya
existe, agrega `## Ronda N` debajo de la anterior: no borres el historial. Numera los
hallazgos con el número de ronda (H2.1, H2.2…) para poder citarlos sin ambigüedad.

    ## Ronda 1
    VEREDICTO: SPEC LISTA | SPEC CON PROBLEMAS

    ### Hallazgos
    - **H1.1** · RF3, criterio 2 · ambigüedad
      Qué falla y por qué.
      **Resuelve**: planner | usuario — pregunta cerrada (si es del usuario)
      **Severidad**: bloquea | menor
      **Estado**: abierto

    ### Ronda anterior (solo desde la ronda 2)
    - H1.1: resuelto | no resuelto | resuelto con decisión del usuario

El planner, al corregir, cambia el **Estado** de cada hallazgo a `resuelto` y, si lo decidió
el usuario, anota `Decisión del usuario: …`. Así la siguiente ronda y `/sdd-continue` tienen
el detalle completo. Si no puedes escribir el archivo, dilo en "Dudas o decisiones" y
devuelve los hallazgos completos en tu respuesta.

## Respuesta
Primera línea: el mismo VEREDICTO. Después, los hallazgos de esta ronda con el mismo formato
del archivo y el resultado de la ronda anterior.
