---
name: cuco-sdd-flow-design
description: SDD · Flujo del coordinador para /sdd-design - referencias, sistema de diseño con el planner y su 🔎. Solo la carga el coordinador.
---
Esta skill es para el coordinador. Las reglas de transparencia, 🔎, contexto y contrato de
respuesta de tu definición valen en cada paso. No hace falta la "Verificación previa", pero
sí `AGENTS.md`: si no existe, recomienda `/sdd-bootstrap` y PARA.

1. Pregunta al usuario si tiene referencias (capturas, frames exportados de Figma, variables
   o estilos en JSON, plantillas HTML/CSS, manual de marca) y pídele que las deje en
   `docs/design/references/`. Un link de Figma solo no sirve: los agentes no pueden
   abrirlo; necesita exportarlo o configurar el servidor MCP de Figma (ver README del kit).
2. @planner con `cuco-sdd-design` en modo CREAR. Si devuelve PREGUNTAS (elegir entre las
   opciones propuestas o resolver referencias contradictorias), házselas de una en una.
3. 🔎 `docs/design/design-system.md`, mostrando la tabla de pares de contraste. Con el
   "sí", @planner lo marca como aprobado.
