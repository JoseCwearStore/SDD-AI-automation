---
name: cuco-sdd-clarify
description: SDD · Revisa una spec como QA antes de aprobarla (solo detecta, no resuelve). Verifica calidad, no intención del usuario.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

Revisa `specs/NNN-nombre/spec.md` (la ruta te la pasa el coordinador) como un QA exigente.
Lee también `docs/constitution.md` y `AGENTS.md`. Solo detecta: no propongas soluciones ni
reescribas la spec.

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

## Cómo clasificar cada hallazgo
- **Corrige el planner**: problemas de forma o de redacción que se arreglan sin saber qué
  quiere el usuario (RF sin criterio, EARS mal formado, mención de stack).
- **Decide el usuario**: huecos que solo se cierran sabiendo qué quiere (comportamiento no
  definido, dos interpretaciones válidas). Formúlalo como pregunta cerrada.

Nunca resuelvas un hallazgo de "Decide el usuario" suponiendo la respuesta.

## Respuesta
Primera línea: `VEREDICTO: SPEC LISTA` o `VEREDICTO: SPEC CON PROBLEMAS`.

Hallazgos numerados, cada uno con:
- Ubicación (RF, criterio o sección)
- Categoría (ambigüedad | contradicción | caso límite | testabilidad | forma | seguridad)
- Qué falla y por qué
- **Resuelve**: planner | usuario (con la pregunta)
