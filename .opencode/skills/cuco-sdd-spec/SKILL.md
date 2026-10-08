---
name: cuco-sdd-spec
description: SDD · Genera la spec de un cambio (qué y por qué) con requisitos EARS y criterios de aceptación. Devuelve preguntas si la petición es ambigua.
---
Si no existe `AGENTS.md`, o le falta una sección que esta skill necesita, PARA y devuelve
BLOQUEADO indicando qué falta y recomendando `/sdd-bootstrap`.

NO escribas código en ningún momento. Lee `docs/constitution.md`, `AGENTS.md` y `MEMORY.md`.
La petición del usuario y sus respuestas previas te las pasa el coordinador.

## Paso 1: eliminar ambigüedades
Si la petición deja dudas sobre casos límite, errores, permisos, o qué queda fuera de esta
versión, o si contradice `AGENTS.md`/constitution: NO supongas. Devuelve Estado PREGUNTAS
con una lista numerada de máximo 5 preguntas, ordenadas de la más a la menos importante.
El coordinador se las hará al usuario de una en una.

## Paso 2: escribir la spec
Con las respuestas, crea `specs/NNN-nombre/spec.md`:
- NNN = siguiente número libre en `specs/`, con 3 dígitos.
- nombre = 2 a 4 palabras en kebab-case que describan el cambio (ej. `001-registro-usuarios`).

Plantilla:

    # NNN — Título
    Estado: borrador

    ## Contexto
    Qué problema resuelve y por qué ahora.

    ## Requisitos
    RF1, RF2… en formato EARS:
    - Siempre:          "El sistema DEBE …"
    - Por evento:       "CUANDO …, el sistema DEBE …"
    - No deseado:       "SI …, ENTONCES el sistema DEBE …"
    - Por estado:       "MIENTRAS …, el sistema DEBE …"

    ## Criterios de aceptación
    Por cada RF, al menos uno:
    - RF1 — Dado …, Cuando …, Entonces … (con valores concretos: ej. username "ab")

    ## Casos límite
    Los que pueden romper las reglas de dominio de `AGENTS.md`.

    ## Acceso y seguridad
    Según `cuco-sdd-security` (modo GUÍA): quién puede hacer cada acción, qué es público,
    qué entradas llegan de fuera y con qué límites. Las reglas de acceso son RF con su
    criterio (ej. "SI un usuario no autenticado …, ENTONCES el sistema DEBE rechazarlo").
    Si el cambio no expone nada nuevo: "Sin cambios de acceso" y por qué.

    ## Datos personales
    Según `cuco-sdd-privacy` (modo GUÍA): tabla de los datos personales nuevos o
    cambiados (dato, finalidad, motivo, conservación, quién lo ve, si sale a terceros).
    Si no hay: "Sin datos personales nuevos".

    ## Accesibilidad
    Según `cuco-sdd-a11y` (modo GUÍA): pantallas nuevas o cambiadas y lo que exigen más
    allá de lo obvio. Si no hay interfaz: "Sin interfaz".

    ## Fuera de alcance
    Lo que explícitamente NO se hace en esta versión.

## Reglas
- Solo el QUÉ y el POR QUÉ: nada de stack, capas, endpoints ni nombres de archivos.
  Excepción: en una spec de infraestructura (ej. la base técnica), lo que se pide ES que
  existan ciertos comandos, archivos o servicios: ahí sí se nombran. Indícalo en el Contexto
  con una línea "Spec de infraestructura: nombra comandos y archivos a propósito".
- Cada RF es verificable: si no se puede escribir un criterio con valores concretos, el RF
  está mal escrito.
- Un RF por comportamiento: si un RF tiene un "y", probablemente son dos.
- No repitas como RF las verificaciones de `docs/constitution.md`: el reviewer las ejecuta
  en cada revisión de código, en todas las specs. Una spec solo pide lo propio del cambio.
