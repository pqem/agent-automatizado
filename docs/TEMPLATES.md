# Templates de AGENTS.md

Sistema de templates mejorados según tipo de proyecto detectado.

## Templates disponibles

### 1. root.md (default)
**Cuándo se usa:** Proyectos genéricos o no reconocidos

**Contenido:**
- Estructura básica
- Convenciones de commits
- Skills generales
- Placeholder para stack

**Detección:** Fallback cuando no matchea ningún tipo específico

---

### 2. api.md
**Cuándo se usa:** Backend / API REST

**Detección automática:**
- Express, Fastify, NestJS, Hono en dependencies
- Estructura típica: `routes/`, `controllers/`, `services/`

**Contenido:**
- Arquitectura en capas (routes → controllers → services → DB)
- Convenciones de endpoints REST
- Status codes y mejores prácticas
- Seguridad (auth, validación, CORS)
- Testing de APIs

**Skills recomendadas:** testing, architecture, debugging

---

### 3. nextjs.md
**Cuándo se usa:** Next.js App Router

**Detección automática:**
- `next` en dependencies
- Presencia de `app/` directory

**Contenido:**
- App Router structure y convenciones
- Server Components vs Client Components
- Data fetching patterns
- Server Actions
- Image optimization y metadata (SEO)
- Performance best practices

**Skills recomendadas:** react, nextjs, testing, design

---

### 4. web.md
**Cuándo se usa:** Frontend genérico (React, Vue, Svelte)

**Detección automática:**
- `react`, `vue`, `svelte` en dependencies
- Sin Next.js o Nuxt

**Contenido:**
- Estructura de componentes
- State management
- Styling conventions
- Build y deployment

**Skills recomendadas:** react, design, testing

---

### 5. python.md
**Cuándo se usa:** Proyectos Python

**Detección automática:**
- `requirements.txt`, `pyproject.toml`, `Pipfile`
- Django, FastAPI, Flask detectados

**Contenido:**
- Virtual environments
- Package management
- Framework-specific conventions
- Testing con pytest

**Skills recomendadas:** pytest, architecture, debugging

---

### 6. ai-agent.md ⭐ (nuevo)
**Cuándo se usa:** Sistemas de agentes IA

**Detección automática:**
- `SOUL.md` + `IDENTITY.md` presentes
- `skills/` directory
- `.claude/` directory

**Contenido:**
- Arquitectura de agente (SOUL, IDENTITY, USER, MEMORY)
- Sistema de skills (frontmatter, auto-invoke)
- AGENTS.md y skill-sync
- Workflow de memoria (daily logs vs long-term)
- Herramientas disponibles
- Testing de skills
- Dog-fooding philosophy

**Skills recomendadas:** context-recovery, resonant-coding

---

## Customización de templates

### Modificar template existente

```bash
vim templates/agents/api.md
```

### Crear template nuevo

1. Crear archivo en `templates/agents/`:
   ```bash
   touch templates/agents/my-template.md
   ```

2. Usar formato con variables:
   ```markdown
   # {{PROJECT_NAME}}
   
   {{DESCRIPTION}}
   
   ## Stack Tecnológico
   {{STACK}}
   
   ## Skills Disponibles
   {{SKILLS_LIST}}
   ```

3. Agregar detección en `lib/detector.js`:
   ```javascript
   if (existsSync(join(projectPath, 'my-marker-file'))) {
     info.type = 'my-type';
   }
   ```

4. Agregar selección en `lib/generator.js`:
   ```javascript
   function selectTemplateForProject(projectInfo) {
     if (projectInfo.type === 'my-type') return 'my-template';
     // ...
   }
   ```

### Variables disponibles

- `{{PROJECT_NAME}}` - Nombre del directorio
- `{{DESCRIPTION}}` - Descripción generada según tipo
- `{{STACK}}` - Stack tecnológico detectado
- `{{STRUCTURE}}` - single / monorepo
- `{{SKILLS_LIST}}` - Placeholder para skill-sync
- `{{LEVEL}}` - Nivel del usuario
- `{{RATE_LIMIT}}` - Para APIs (100 default)

### Condicionales (Handlebars-like)

```markdown
{{#if LEVEL_BEGINNER}}
Explicar cada paso detalladamente.
{{/if}}

{{#if LEVEL_INTERMEDIATE}}
Asumir conocimiento básico.
{{/if}}

{{#if LEVEL_ADVANCED}}
Sé conciso, solo código.
{{/if}}
```

## Testing de templates

### Ver qué template se usaría

```bash
node src/cli.js detect
# Muestra tipo detectado

# Template usado sería:
# nextjs → nextjs.md
# api → api.md
# web → web.md
# ...
```

### Generar y verificar

```bash
# Proyecto de prueba
mkdir test-nextjs && cd test-nextjs
npm init -y
npm install next react react-dom

# Generar
node ../agent-automatizado/src/cli.js init

# Verificar
cat AGENTS.md | head -50
# Debería tener contenido específico de Next.js

# Limpiar
cd .. && rm -rf test-nextjs
```

## Mejores prácticas

### Contenido de templates

**✅ Incluir:**
- Convenciones específicas del stack
- Arquitectura típica del proyecto
- Mejores prácticas del framework
- Comandos comunes
- Referencias a skills relevantes

**❌ Evitar:**
- Documentación exhaustiva del framework (ya está online)
- Código boilerplate extenso
- Info que queda obsoleta rápido

### Nivel de detalle

**Beginner:**
- Explicaciones detalladas
- Ejemplos paso a paso
- Links a recursos externos

**Intermediate:**
- Asumir conocimiento básico
- Enfocar en decisiones arquitectónicas
- Patterns y anti-patterns

**Advanced:**
- Conciso y directo
- Solo lo específico del proyecto
- Referencia rápida

### Mantenimiento

**Revisar templates cuando:**
- Framework saca versión major nueva
- Cambios significativos en best practices
- Feedback de usuarios sobre falta de info

**Versionado:**
Considerar templates versionados si hay breaking changes:
```
templates/agents/
├── nextjs.md      (Next.js 15)
├── nextjs-14.md   (legacy)
└── nextjs-13.md   (legacy)
```

## Roadmap de templates

### Próximos templates

- [ ] `fullstack.md` - Monorepo frontend + backend
- [ ] `mobile.md` - React Native / Expo
- [ ] `cli.md` - Node CLI tools
- [ ] `monorepo.md` - Turborepo / Nx
- [ ] `django.md` - Django específico
- [ ] `fastapi.md` - FastAPI específico

### Mejoras futuras

- [ ] Templates multilenguaje (ES, EN)
- [ ] Generación dinámica según dependencies
- [ ] Templates contributibles por comunidad
- [ ] Registry de templates compartidos
