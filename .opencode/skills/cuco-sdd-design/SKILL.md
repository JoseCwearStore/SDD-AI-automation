---
name: cuco-sdd-design
description: SDD · Sistema de diseño mínimo (paleta con roles y contraste verificado, tipografía) en docs/design/design-system.md. Modo CREAR - desde cero o desde referencias (capturas, exportaciones de Figma, plantillas, manual de marca). Modo GUÍA - spec, plan y código usan solo tokens. Obligatorio antes de la primera spec con pantallas.
---
Si no existe `AGENTS.md`, PARA y devuelve BLOQUEADO recomendando `/sdd-bootstrap`.

Lee `AGENTS.md` (sobre todo "Diseño", "Cumplimiento" y "Arquitectura") y, si existen,
`docs/design/design-system.md` y `docs/design/references/`. El modo te lo pasa el
coordinador. Si el proyecto no tiene interfaz de usuario, dilo y termina: no hace falta.

## Reglas que valen siempre
- El sistema de diseño es la **fuente de verdad** visual: ningún color, tipografía, tamaño de
  letra, espaciado ni radio se escribe "a mano" en el código; todo sale de sus tokens.
- **Contraste (A2 de `cuco-sdd-a11y`)**: cada par texto/fondo que se use cumple WCAG AA:
  ≥ 4.5:1 para texto normal y ≥ 3:1 para texto grande y componentes. Calcúlalo con la
  fórmula de WCAG (luminancia relativa L = 0.2126 R + 0.7152 G + 0.0722 B, con cada canal
  linealizado; ratio = (L1 + 0.05) / (L2 + 0.05)). Si no puedes calcularlo con seguridad,
  márcalo "por verificar": lo comprueba el test de tokens de la primera spec con pantallas.
- **Licencias (P12 de `cuco-sdd-privacy`)**: cada fuente o icono externo lleva su origen y su
  licencia. Nada sin licencia clara.
- **Un link de Figma solo no se puede leer** (requiere sesión y no tienes acceso web). Si el
  usuario solo da un link, pídele exportaciones (camino A) o que configure el servidor MCP de
  Figma en OpenCode (camino B; ver el README del kit).
- Para analizar imágenes hace falta un modelo con visión. Si no puedes ver una imagen de
  `references/`, dilo: no inventes lo que contiene.

## Modo CREAR (planner, con `/sdd-design` o desde el bootstrap)
1. **Con referencias** en `docs/design/references/` (capturas o frames exportados de Figma en
   PNG/JPG, variables o estilos exportados en JSON, plantillas HTML/CSS, manual de marca en
   PDF): extrae la paleta, la tipografía y, si se ven, espaciados y radios. Cada valor lleva
   su **origen** (archivo de referencia). Lo que no puedas determinar con seguridad, PREGUNTAS.
   Si dos referencias se contradicen, PREGUNTAS: nunca elijas por tu cuenta.
2. **Sin referencias**: propón 2 o 3 opciones completas (paleta + tipografía), cada una con su
   carácter, sus pares de contraste calculados y su licencia, y recomienda una según el
   producto y su público. Devuelve PREGUNTAS para que el usuario elija.
3. Escribe `docs/design/design-system.md` con la plantilla de abajo (o, si existe, propón el
   diff y aplícalo solo con la aprobación del usuario).

## Plantilla de `docs/design/design-system.md`

    # Sistema de diseño — <nombre del proyecto>
    Estado: borrador

    ## Origen
    Referencias usadas (archivo → qué se tomó) o "Creado desde cero: opción N elegida".

    ## Paleta (obligatorio)
    | Token | Valor | Rol / uso |
    |-------|-------|-----------|
    | color-primary | #… | acciones principales |
    | color-bg | #… | fondo |
    | color-text | #… | texto principal |
    | color-error | #… | errores (siempre con texto o icono, no solo color: A8) |

    ## Pares de contraste (obligatorio)
    | Texto | Fondo | Ratio | AA |
    |-------|-------|-------|----|

    ## Tipografía (obligatorio)
    Familias (con fuente de reserva y licencia) y escala por rol:
    | Token | Familia | Tamaño | Alto de línea | Peso | Uso |
    |-------|---------|--------|---------------|------|-----|

    ## Opcional: espaciado, radios, sombras, breakpoints, modo oscuro, componentes base

    ## Reglas
    - Todo valor visual sale de estos tokens. Un valor nuevo se agrega aquí primero.

Cuando el usuario lo apruebe, el coordinador te pide cambiar a "Estado: aprobado".

## Modo GUÍA (prevenir)
- **Spec** (planner): en la sección "Accesibilidad", cada pantalla nueva indica su referencia
  visual si existe (`docs/design/references/…`).
- **Plan** (planner): en "11. Diseño", qué tokens y componentes usa cada pantalla. En la
  **primera spec con pantallas**, una tarea crea los tokens en código (variables CSS o el tema
  del framework, generados desde `design-system.md`) y un test que comprueba los pares de
  contraste de la tabla.
- **Código** (implementer): solo tokens; si una pantalla necesita un valor que no existe,
  PARA y devuelve PREGUNTAS (el valor se agrega primero al sistema de diseño).
- **Revisión** (reviewer, en `cuco-sdd-review`): un color, fuente, tamaño o espaciado literal
  fuera del archivo de tokens es un hallazgo.
