---
name: cuco-sdd-bootstrap
description: SDD · Prepara un proyecto para el flujo SDD. GREENFIELD (solo la idea) - entrevista y genera visión, roadmap, AGENTS.md y MEMORY.md. BROWNFIELD (código existente) - describe lo que hay. Arquitectura hexagonal por defecto en back y front. Nunca pisa archivos existentes. No requiere que exista AGENTS.md.
---
Esta skill NO requiere `AGENTS.md`: es la que lo crea. La petición del usuario, sus
respuestas previas y el inventario de archivos te los pasa el coordinador.

## 0. Inventario (antes de nada)
Comprueba cuáles existen: `AGENTS.md`, `MEMORY.md`, `docs/constitution.md` y
`specs/000-vision/`. Regla para cada uno:
- **No existe** → lo generas de cero con las plantillas de esta skill.
- **Existe** → NO lo regeneras ni lo sobrescribes. Si está incompleto o contradice lo que
  decidió el usuario, propón un diff en tu respuesta ("Antes / Después" por sección). Solo
  lo aplicas cuando el coordinador te diga que el usuario lo aprobó.
Indica el inventario en tu respuesta.

## 1. Detecta el modo
- **GREENFIELD**: no hay código fuera de `.opencode/` (ni manifiestos como `package.json`,
  `pyproject.toml`, `go.mod`, ni carpetas de código). `AGENTS.md`, `MEMORY.md`, `docs/` y
  `specs/` no cuentan como código.
- **BROWNFIELD**: hay código existente.
Indica el modo detectado en tu respuesta.

## Modo GREENFIELD

Trabaja por rondas. En cada ronda, si quedan dudas, devuelve Estado PREGUNTAS (máximo 5,
de la más a la menos importante). Una etapa puede necesitar varias rondas. No preguntes lo
que la idea del usuario ya responde. Guarda el avance en `specs/000-vision/vision.md` con
"Estado: borrador" para no perder contexto entre rondas.

### Etapa 1: Producto (el QUÉ, nada técnico)
- Nombre del proyecto (se usa en el título de `AGENTS.md` y de la constitución).
- Tipo de aplicación y problema que resuelve.
- Usuarios: quiénes son, qué roles hay y qué puede hacer cada uno.
- Tenencia: ¿un solo usuario, varios usuarios independientes, u organizaciones con varios
  usuarios cada una (multi-tenant)? ¿Los datos de unos deben estar aislados de otros?
- Plataforma y contexto: web, móvil, escritorio, CLI o API; ¿necesita funcionar sin conexión?
- Integraciones externas: pagos, correo, mapas, otras APIs.
- Alcance de la primera versión y lo que queda fuera.

### Etapa 2: Dominio (las reglas de negocio)
Identifica las reglas que la idea da por supuestas. Por cada regla, elimina la ambigüedad en
estas cuatro dimensiones:
- **Ámbito**: ¿sobre qué entidad o agrupación se aplica?
- **Tipo**: ¿es un límite que el sistema impone o una recomendación que solo avisa?
- **Período**: si depende del tiempo, ¿qué ventana exacta y en qué zona horaria?
- **Valores**: mínimos, máximos, unidades y qué pasa justo en el borde.
Ejemplos de la FORMA (no del contenido): "máximo 3 reservas por usuario y semana",
"un pedido no se puede modificar después de enviado", "alerta si el saldo baja de 100".
Identifica también:
- El glosario: los términos del dominio y su significado exacto.
- Los datos sensibles (salud, finanzas, ubicación, datos personales) y quién puede verlos.

### Etapa 3: Requisitos no funcionales
Solo los que importan para esta idea: privacidad y normativa, volumen esperado de usuarios y
datos, disponibilidad, rendimiento, accesibilidad e idiomas.
Seguridad (siempre, aunque el usuario no la mencione):
- ¿Estará expuesto a internet? ¿Quién puede usarlo sin cuenta?
- ¿Hay roles con más poder (admin, moderador)? ¿Qué pueden hacer que otros no?
- ¿Qué datos sensibles maneja y quién puede verlos?
- ¿Qué servicios externos usan claves o secretos?
- ¿Qué eventos de seguridad quiere poder revisar (logins fallidos, abusos, acciones admin)?
Cumplimiento (siempre; decide qué controles de `cuco-sdd-privacy` y `cuco-sdd-a11y` aplican):
- Jurisdicción(es): dónde opera y dónde están sus usuarios (ej. México: LFPDPPP y derechos
  ARCO; UE: RGPD). Ante la duda, se aplica la más estricta.
- ¿Guarda datos personales? ¿Hay pagos? ¿Envía correos? ¿Cookies o analítica no esenciales?
- ¿Pueden usarlo menores? Edad mínima (decisión del usuario según la ley).
- ¿Usa imágenes, fuentes o multimedia de terceros?
- Responsable del producto (persona o empresa y contacto): lo completa el usuario.
- Nivel de accesibilidad: WCAG 2.2 AA por defecto.

### Etapa 4: Técnica
**Arquitectura por defecto: hexagonal (puertos y adaptadores) en backend Y frontend,
organizada por módulo** (screaming architecture). En tu primera ronda técnica, díselo
EXPLÍCITAMENTE al usuario como una de las preguntas: "Por defecto se usa arquitectura
hexagonal en back y front. ¿La mantenemos o prefieres otra (MVC, capas…)?". Solo cambias si
el usuario lo pide; en ese caso, respeta su elección y señala sus riesgos.

Para el resto de decisiones, propón 2 o 3 opciones con sus ventajas y desventajas, y
recomienda una según el problema. Si el usuario ya tiene una preferencia, respétala y
señala sus riesgos.
- Lenguaje y frameworks (backend, frontend o lo que aplique).
- Organización de carpetas (monorepo o no) siguiendo la arquitectura elegida.
- Persistencia: tipo de base de datos y herramienta de acceso.
- Autenticación y autorización, si hay usuarios.
- Seguridad del borde: limitador de peticiones, validación de entradas, logger y, si la
  base es PostgreSQL o Supabase, la estrategia de RLS (los 10 controles de
  `cuco-sdd-security`). Para las librerías, propón opciones como en el resto.
- Entorno y despliegue: cómo se levanta en local y dónde correrá.
- Estrategia de tests y verificaciones automáticas (tests, arquitectura, tipos). Incluye
  una herramienta que verifique la dirección de dependencias de la arquitectura.

### Etapa 5: Roadmap
Divide la primera versión en specs pequeñas y entregables en
`specs/000-vision/roadmap.md`. La 001 es siempre la base técnica (entorno, estructura y
comandos de calidad funcionando). Cada spec debería tener como máximo ~10 RF.

### Etapa 6: Generar los archivos
Con todas las etapas cerradas, genera (solo los que no existían, ver el inventario):
`AGENTS.md` y `MEMORY.md` con las plantillas de abajo. Rellena TODO: nada de
`<placeholders>` sin sustituir. La constitución NO la generas aquí: es la skill
`cuco-sdd-constitution`.

## Modo BROWNFIELD
1. Lee los manifiestos, los scripts, la estructura de carpetas, los tests y la configuración
   de CI que existan.
2. Genera (o, si existe, propón el diff de) un `AGENTS.md` que describa lo que HAY, no lo que
   convendría que hubiera. Lo que no puedas deducir del código, márcalo como "Desconocido" y
   pregúntalo (Estado PREGUNTAS).
3. Si la arquitectura actual no es hexagonal, descríbela tal cual e indícalo al usuario en
   "Dudas o decisiones" (migrarla sería una spec aparte, no parte del bootstrap).
4. Si falta algo que el contrato exige (ej. no hay comando de tests), indícalo en "Dudas o
   decisiones": no lo inventes.
5. Si los tests de aceptación no viven en carpetas `acceptance/`, avísalo: los permisos del
   tester dependen de esa convención.
No generes visión ni roadmap salvo que el usuario lo pida.

## Plantilla de `specs/000-vision/vision.md`

    # Visión — <nombre del proyecto>
    Estado: borrador

    ## Producto
    ## Usuarios y roles
    ## Reglas de dominio (RD1, RD2…: ámbito, tipo, período, valores)
    ## Glosario
    ## Datos sensibles
    ## Requisitos no funcionales
    ## Decisiones técnicas (opción elegida, alternativas descartadas y por qué)
    ## Fuera de alcance de la primera versión

## Plantilla de `specs/000-vision/roadmap.md`

    # Roadmap — <nombre del proyecto>

    | Spec | Nombre | Objetivo | Depende de |
    |------|--------|----------|------------|
    | 001  | base-tecnica | Entorno, estructura y comandos de calidad | — |

## Plantilla de AGENTS.md (las secciones marcadas con * son obligatorias)

    # AGENTS.md — <nombre del proyecto>
    <qué es el proyecto, en 2 o 3 líneas>

    ## Stack *
    ## Comandos *
    Con estas etiquetas exactas (las buscan las skills). Si una no aplica: "No aplica". Si
    el comando nacerá en una spec futura: "No aplica hasta la spec NNN (entonces: …)"; nunca
    lo escribas como si ya existiera, porque las skills lo ejecutan.
    - Levantar el entorno:
    - Tests (todos):
    - Tests unitarios:
    - Verificación de arquitectura:
    - Verificación de tipos:
    - Verificación de seguridad:
    ## Antes de tocar código
    Leer `docs/constitution.md`, la spec activa (`specs/NNN-*/`) y `MEMORY.md`.
    ## Arquitectura *
    Hexagonal (salvo que el usuario eligiera otra). Las dependencias apuntan HACIA ADENTRO.
    Árbol de carpetas real del backend y del frontend, por módulo, con sus capas:
    - `domain/`: entidades, value objects, reglas y puertos. No importa nada externo.
    - `application/`: casos de uso. Solo importa de `domain/`.
    - `infrastructure/`: adaptadores (HTTP, persistencia, clientes externos, fakes).
    - Frontend: además, `ui/` (componentes), que nunca llama a la red directamente.
    - Composition root: único lugar donde se conectan los adaptadores.
    ## Reglas de dominio *
    Las RD de la visión, en su forma operativa (las que es fácil romper).
    ## Tests *
    - Aceptación: SIEMPRE en carpetas `acceptance/` (los permisos del tester dependen de
      ello). Los escribe solo el tester, nombrados `NNN-RFn: <qué comprueba>`.
    - Unitarios y de integración: dónde viven y cómo se distinguen (ej. sufijos de archivo).
      Los escribe el implementer.
    - Fakes compartidos (adaptadores en memoria, reloj falso): los escribe el implementer.
    - Aislamiento: por cada recurso externo de los tests (base de datos, almacenamiento,
      colas, correo), su configuración de test propia, sin caer en la de desarrollo,
      validada (nombre de test + hosts permitidos) y con fallo explícito si no es válida.
    ## Seguridad *
    Lo concreto de este stack para los controles C1–C10 de `cuco-sdd-security`. Si uno no
    aplica, "No aplica" y por qué.
    - Exposición: público en internet o no; qué se puede usar sin cuenta.
    - Rate limiting (C1): herramienta y límites (ej. login: N intentos por IP y minuto).
    - Secretos (C2, C4): dónde viven, cómo se leen, qué prefijo de variable llega al
      navegador (y por tanto nunca lleva secretos).
    - Base de datos (C3, C6): motor; si es PostgreSQL/Supabase, RLS con ENABLE + FORCE y
      políticas; rol de la app con mínimo privilegio; puerto no expuesto.
    - Entradas (C5): dónde y con qué se validan.
    - Auth (C7): mecanismo, dónde vive el middleware, roles y dónde viven las políticas.
    - Errores (C8): el manejador único y qué devuelve.
    - Debug/admin (C9): qué rutas existen y cómo se protegen o desactivan en producción.
    - Logs (C10): puerto y adaptador del logger, eventos registrados, campos prohibidos.
    ## Cumplimiento *
    Lo concreto de este proyecto para `cuco-sdd-privacy` (P1–P12) y `cuco-sdd-a11y` (A1–A8).
    - Jurisdicción(es) y la regla aplicada ante la duda.
    - Qué controles aplican y cuáles no, con el porqué (ej. "P9 No aplica: sin pagos").
    - Edad mínima, consentimientos que se piden, cookies esenciales y no esenciales.
    - Responsable del producto: `👤 [completar: nombre y contacto]` hasta que el usuario lo dé.
    - Accesibilidad: nivel objetivo (WCAG 2.2 AA) y herramienta de verificación en tests.
    - Documentos legales previstos para el release (`docs/legal/`): siempre BORRADORES.
    ## Convenciones
    Idioma y registro de la interfaz, idioma del código, commits convencionales.
    ## Requisitos del modelo
    El flujo SDD usa subagentes: el modelo elegido debe soportarlos. Usar siempre el agente
    `coordinator`, nunca Build, para `/sdd`, `/sdd-continue`, `/sdd-feature` y `/sdd-change`.
    ## Skills
    El flujo SDD usa SOLO las skills locales `.opencode/skills/cuco-sdd-*/`. Las skills
    globales `sdd-*` son otro flujo y no se usan. Las de terceros (`.agents/skills/`) solo se
    usan si se habilitan en el permiso `skill` de un agente.
    ## Forma de trabajar
    TDD; solo lo que se pide; cambios pequeños; al terminar, resumir y señalar qué revisar.
    ## Memoria
    Leer `MEMORY.md` al empezar y actualizarlo al terminar. Nunca datos sensibles.
    Objetivo ~50 líneas para estado, pendientes y decisiones, con estas reglas al recortar:
    - Solo se quita lo que ya vive en otro archivo (`AGENTS.md`, la visión, las specs o sus
      informes), dejando una referencia a dónde está.
    - "Errores a evitar" NO cuenta para el límite y nunca se recorta: cada línea costó un
      error real. Si una se vuelve regla permanente, se propone moverla a `AGENTS.md`.
    - Ante la duda, gana no perder información: pasarse de 50 líneas está bien.
    ## Límites
    ✅ Siempre · ⚠️ Preguntar antes (dependencias, esquema de datos, módulos nuevos,
    contratos) · 🚫 Nunca.

## Plantilla de MEMORY.md

    # MEMORY

    ## Estado actual
    - Bootstrap completado (<fecha>). Siguiente paso: `/sdd` con la spec 001 del roadmap.

    ## Pendiente para retomar
    - (vacío)

    ## Decisiones (con su porqué)
    - Arquitectura <hexagonal | la elegida>: <porqué>.
    - <cada decisión técnica de la Etapa 4, con la alternativa descartada>.

    ## Errores a evitar
    - (vacío)

## Reglas
- Nunca escribas el frontmatter de los agentes ni nada dentro de `.opencode/`.
- Nunca sobrescribas un archivo que ya existía sin la aprobación del usuario (ver el
  inventario).
- Nunca decidas por el usuario: propones opciones y recomiendas una.
- Cuando el coordinador te diga que el usuario aprobó la visión, cambia a "Estado: aprobada".
- En "Archivos" de tu respuesta, lista las rutas exactas que creaste: el usuario las va a
  revisar.
