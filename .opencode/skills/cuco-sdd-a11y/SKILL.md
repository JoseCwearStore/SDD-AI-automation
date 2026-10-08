---
name: cuco-sdd-a11y
description: SDD · Accesibilidad (WCAG 2.2 AA) con 8 controles (A1–A8). Modo GUÍA - criterios para spec, plan, tests y código de cada pantalla. Modo AUDITORÍA - verifica las pantallas que tocó la spec en la fase de cumplimiento y asigna cada hallazgo a su responsable.
---
Si no existe `AGENTS.md`, o le falta la sección "Cumplimiento", PARA y devuelve BLOQUEADO
indicando qué falta y recomendando `/sdd-bootstrap`.

Lee `AGENTS.md` (sobre todo "Cumplimiento", "Arquitectura", "Tests" y "Comandos"). El modo
(GUÍA o AUDITORÍA) y las rutas te los pasa el coordinador. Si el proyecto o la spec no tienen
interfaz de usuario, todos los controles son NO APLICA: dilo en una línea y termina.

El objetivo por defecto es **WCAG 2.2 nivel AA**, salvo que `AGENTS.md` diga otro.

## Los 8 controles
**A1 · Texto alternativo.** Toda imagen informativa tiene `alt` que dice lo que comunica; la
decorativa, `alt=""`. Los botones e iconos sin texto visible tienen nombre accesible
(`aria-label` o texto oculto). Nada de "imagen", "icono" o el nombre del archivo como `alt`.

**A2 · Contraste.** Texto normal ≥ 4.5:1; texto grande (≥ 24 px, o 19 px en negrita) y
componentes de interfaz (bordes de campos, iconos con significado, foco) ≥ 3:1, también en
estados hover, foco, deshabilitado y en modo oscuro si existe. Los pares de base están
en la tabla de contraste de `docs/design/design-system.md`.

**A3 · Teclado.** Todo lo que se hace con el ratón se hace con el teclado (Tab, Shift+Tab,
Enter, Espacio, Escape, flechas donde corresponda), en un orden lógico, sin trampas de foco.
El foco siempre es visible. Nada de `tabindex` positivo.

**A4 · Formularios.** Cada campo tiene una etiqueta asociada (no solo `placeholder`). Los
errores se muestran junto al campo, se asocian a él (`aria-describedby`) y se anuncian. Los
campos obligatorios se indican con texto, no solo con color o un asterisco sin explicar.

**A5 · Semántica.** Elementos nativos para lo que son (`button` para acciones, `a` para
navegar, nunca un `div` clicable), encabezados en orden, regiones (`main`, `nav`, `header`),
`lang` del documento y títulos de página únicos.

**A6 · Cambios dinámicos.** Cargas, errores y confirmaciones que aparecen sin recargar se
anuncian (`aria-live` o rol `status`/`alert`). Los diálogos mueven el foco adentro, lo
atrapan mientras están abiertos y lo devuelven al cerrar.

**A7 · Adaptabilidad.** Usable con zoom al 200 % y a 320 px de ancho sin scroll horizontal ni
contenido cortado. Respeta `prefers-reduced-motion`. Los objetivos táctiles miden ≥ 24×24 px.

**A8 · No solo color.** Ninguna información depende solo del color (errores, estados,
gráficos, enlaces dentro de texto).

## Modo GUÍA (prevenir)
- **Spec** (planner): la sección "Accesibilidad" lista las pantallas nuevas o cambiadas y lo
  que cada una exige más allá de lo obvio (ej. "el feed anuncia los posts nuevos", "el
  diálogo de borrar se puede cancelar con Escape"). Los criterios de aceptación nombran los
  elementos por su texto visible o su rol ("el botón 'Publicar'"), no por clases ni ids.
- **Plan** (planner): en "Cumplimiento", cómo cumple cada pantalla A1–A8 y cómo se prueba.
  Una herramienta automática de accesibilidad para tests (ej. axe) es una dependencia nueva:
  "⚠️ Requiere aprobación".
- **Tests** (tester): las consultas de los tests buscan por rol y nombre accesible
  (`getByRole('button', { name: 'Publicar' })`, `getByLabelText`), nunca por clase o id: si
  un elemento no se encuentra así, es un fallo de accesibilidad, no del test. Los criterios
  de teclado de la spec se prueban con eventos de teclado.
- **Código** (implementer): cumple A1–A8 en lo que toca la tarea. Si un diseño pedido no
  puede cumplir un control (ej. un color de marca sin contraste), devuelve PREGUNTAS.

## Modo AUDITORÍA (fase de cumplimiento)
Lo usa el reviewer. Solo detectas: no corriges nada.
1. Revisa las pantallas y componentes del diff (o del mini plan en modo feature).
2. Si `AGENTS.md` define un comando de verificación de accesibilidad, ejecútalo.
3. Para cada control: **CUMPLE** (con evidencia: test o `archivo:línea`), **NO CUMPLE**
   (hallazgo), **NO APLICA** (por qué) o **MANUAL** (pasos exactos para el usuario).
   Siempre son MANUAL: la prueba con un lector de pantalla real, el contraste sobre imágenes
   o degradados, y el recorrido completo con teclado en el navegador si no hay test que lo
   cubra.
4. Cada hallazgo lleva **Responsable**: planner (falta en spec o plan), tester (falta el
   test o consulta por clase/id), implementer (el código no cumple).

Escribe tu resultado en la sección "Accesibilidad" del informe de cumplimiento (formato en
`cuco-sdd-privacy`, modo AUDITORÍA). Un NO CUMPLE de un control que aplica bloquea.
