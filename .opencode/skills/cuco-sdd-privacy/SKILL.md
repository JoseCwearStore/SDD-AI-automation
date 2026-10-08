---
name: cuco-sdd-privacy
description: SDD · Privacidad, legal y prácticas honestas con 12 controles (P1–P12). Modo GUÍA - para spec, plan y código. Modo AUDITORÍA - fase de cumplimiento de cada spec (escribe compliance.md). Modo RELEASE - con el producto listo, genera los BORRADORES legales desde el inventario real y la lista de lo que es 100% del usuario.
---
Si no existe `AGENTS.md`, o le falta la sección "Cumplimiento", PARA y devuelve BLOQUEADO
indicando qué falta y recomendando `/sdd-bootstrap`.

Lee `AGENTS.md` (sobre todo "Cumplimiento" y "Seguridad"). El modo (GUÍA, AUDITORÍA o
RELEASE) y las rutas te los pasa el coordinador. La sección "Cumplimiento" de `AGENTS.md`
dice la jurisdicción, qué controles aplican y los valores concretos (edad mínima, datos del
responsable…): esta skill define QUÉ controlar y CÓMO comprobarlo.

## Reglas que valen siempre
- **No eres abogado ni lo finges.** Todo texto legal que generes es un BORRADOR que debe
  revisar un profesional de la jurisdicción del proyecto. Dilo siempre.
- **Nunca inventes datos reales**: razón social, domicilio, correo de contacto, nombres,
  cifras, certificaciones, reseñas o testimonios. Deja un hueco `👤 [completar: …]`.
- **Nunca generes contenido falso presentado como real** (reseñas, testimonios, métricas,
  usuarios de ejemplo en la interfaz de producción). Los datos de prueba se marcan como tales.
- En caso de duda entre jurisdicciones, aplica la regla más estricta y dilo.
- Cada control tiene un tipo: 🤖 los agentes lo implementan y verifican; 🤝 los agentes
  preparan y el usuario decide o valida; 👤 es del usuario.

## Los 12 controles
**P1 · Minimización 🤖.** Cada dato personal que se guarda, se registra en logs o se envía
fuera tiene una finalidad escrita en la spec. Un campo sin finalidad no se guarda.

**P2 · Inventario de datos 🤖.** Cada spec declara los datos personales nuevos o cambiados
(dato, finalidad, base o motivo, conservación, quién lo ve, si sale a terceros). El release
los junta en el inventario del producto.

**P3 · Consentimientos 🤖.** Lo que requiere consentimiento (según `AGENTS.md`) se pide con
casillas sin marcar, separado por finalidad, y se guarda qué se aceptó, qué versión del
documento y cuándo. Retirarlo es tan fácil como darlo. Nada opcional se activa antes.

**P4 · Cookies y almacenamiento 🤝.** Inventario de cookies y almacenamiento local (nombre,
finalidad, duración, si es esencial). Sin cookies no esenciales no hace falta banner; si las
hay, nada no esencial se carga antes del consentimiento y rechazar es igual de fácil que
aceptar. La necesidad del banner la confirma el usuario según su jurisdicción.

**P5 · Terceros y SDKs 🤝.** Cada dependencia o servicio externo nuevo declara qué datos
recibe y para qué; sin vulnerabilidades conocidas altas o críticas (auditoría del gestor de
paquetes); licencias compatibles. Nada de analítica o rastreo que la spec no pida.

**P6 · Derechos del titular 🤖.** Si hay datos personales: el usuario puede ver y descargar
sus datos y **eliminar su cuenta**, con efecto sobre todos sus datos (o anonimizados donde
deban conservarse) y un plazo declarado. Los plazos legales y lo que se conserva los decide
el usuario.

**P7 · Menores 🤝.** Si el producto puede tener usuarios menores, hay una declaración de edad
al registrarse y se bloquea por debajo de la edad mínima de `AGENTS.md` (la decide el
usuario según la ley aplicable).

**P8 · Sin patrones oscuros 🤝.** Sin casillas premarcadas, sin culpabilizar al rechazar, sin
botones de "aceptar" destacados frente a "rechazar", sin cancelaciones escondidas: darse de
baja o borrar la cuenta es tan fácil como registrarse.

**P9 · Precios transparentes 👤.** Solo si hay pagos: precio total (impuestos y cargos) visible
antes de confirmar, renovaciones avisadas y política de reembolso enlazada. La política es
del usuario.

**P10 · Contenido honesto 🤝.** Sin reseñas ni testimonios falsos; sin afirmaciones absolutas
o comparativas ("el mejor", "100 % seguro", "n.º 1") sin evidencia que el usuario aporte.

**P11 · Correos 🤖.** Solo si el producto envía correos no transaccionales: enlace de baja
visible y cabecera `List-Unsubscribe`; la baja se respeta sin pasos extra.

**P12 · Multimedia y licencias 🤝.** Cada imagen, fuente, icono, audio o vídeo de terceros
figura en un manifiesto con su origen y licencia. Nada sin licencia clara. Los derechos los
garantiza el usuario.

## Modo GUÍA (prevenir)
- **Spec** (planner): la sección "Datos personales" lleva la tabla de P2 ("Sin datos
  personales nuevos" si no hay) y, si aplica, lo que pide P3, P6, P7, P8 o P11.
- **Plan** (planner): en "Cumplimiento", para cada control que toca la spec, "Aplica: cómo" o
  "No aplica: por qué". Servicios o SDKs nuevos → "⚠️ Requiere aprobación" con los datos que
  reciben (P5).
- **Código** (implementer): cumple los controles que toca la tarea; nunca registres en logs
  datos personales que la spec no autoriza.

## Modo AUDITORÍA (fase de cumplimiento de cada spec)
Lo usa el reviewer después de la auditoría de seguridad. Solo detectas.
1. Lee la spec (secciones "Datos personales" y "Accesibilidad"), el plan ("Cumplimiento") y
   el diff. En modo feature, el mini plan.
2. Para cada control P1–P12: **CUMPLE** (evidencia), **NO CUMPLE** (hallazgo), **NO APLICA**
   (por qué) o **MANUAL** / **👤 USUARIO** (lo que solo puede hacer o decidir el usuario,
   con los pasos exactos).
3. Comprobaciones mínimas: cada columna o campo nuevo con datos personales está en la tabla
   de P2 con finalidad (P1); los logs nuevos no incluyen datos personales sin autorización;
   dependencias nuevas con su auditoría de vulnerabilidades y licencia (P5); textos de
   interfaz nuevos sin patrones oscuros ni afirmaciones sin evidencia (P8, P10).
4. Cada hallazgo lleva **Responsable**: planner, tester o implementer.
5. Carga también `cuco-sdd-a11y` en modo AUDITORÍA para la sección de accesibilidad.

Guarda el resultado en `specs/NNN-nombre/compliance.md` (en modo feature, en tu respuesta).
Si ya existe, agrega `## Ronda N` debajo y verifica primero los hallazgos anteriores.

    ## Ronda 1
    VEREDICTO: CUMPLE | CAMBIOS NECESARIOS

    ### Privacidad
    | Control | Resultado | Evidencia |
    |---------|-----------|-----------|

    ### Accesibilidad
    | Control | Resultado | Evidencia |
    |---------|-----------|-----------|

    ### Hallazgos que bloquean
    1. P1 · `archivo:línea` — qué incumple — qué se espera — **Responsable**: planner | tester | implementer

    ### 👤 Del usuario y checks manuales
    - [ ] P7 — decidir la edad mínima (pasos exactos).

En tu respuesta, la primera línea es el mismo VEREDICTO. Un NO CUMPLE de un control que
aplica bloquea; lo 👤 y MANUAL no bloquean la spec, pero se acumulan para el release.

## Modo RELEASE (producto listo, `/sdd-release`)
Lo usa el planner para generar los borradores y el reviewer para verificar.

**Planner:** genera o actualiza en `docs/legal/`, a partir de `AGENTS.md`, la visión, las
secciones "Datos personales" de todas las specs y el código:
- `inventario-datos.md` (P2 completo) y `cookies.md` (P4) — reflejan lo que el código hace.
- `privacidad.md`, `terminos.md` y `contacto.md` (datos del responsable); `reembolsos.md`
  solo si hay pagos. Solo los que la sección "Cumplimiento" marca como necesarios.

Tres reglas que no se negocian en esos documentos:
1. **Encabezado obligatorio**, primera línea de cada documento legal:
   `> ⚠️ BORRADOR — generado por IA a partir del código. Requiere revisión legal antes de publicarse.`
   Ningún agente lo quita nunca: solo el usuario, a mano, cuando un profesional lo revisó.
2. **Checklist final** `## 👤 Te corresponde a ti`, con cada dato a completar, cada
   decisión pendiente y la revisión legal.
3. **El release no está listo** mientras quede un documento con ese encabezado o un ítem 👤
   sin marcar: dilo explícitamente en tu respuesta.

**Reviewer:** verifica de punta a punta (registro con consentimiento, eliminación de cuenta,
enlaces a los documentos desde la interfaz, que el inventario coincide con el código) y
escribe `docs/release/release.md`, por rondas, con:
`VEREDICTO: LISTO PARA REVISIÓN LEGAL | CAMBIOS NECESARIOS` (nunca "listo para publicar":
eso lo decide el usuario), los hallazgos con responsable (si falta una funcionalidad, como
borrar la cuenta, propone la spec que la cubriría), la lista completa de 👤 y todos los
checks manuales acumulados en los `compliance.md` y `security.md` de las specs.
