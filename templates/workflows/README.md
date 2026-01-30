# Workflows Templates - Los Tres Expertos

Templates estructurados para aplicar metodología Resonant Coding en proyectos.

## 🎯 Concepto

Dividir cualquier proyecto grande en 3 conversaciones independientes (baldes limpios):

1. **Investigación** - El Investigador
2. **Planificación** - La Estratega  
3. **Ejecución** - El Ejecutor (una por tarea)

## 📄 Templates Disponibles

### 01-investigacion.md

**Objetivo:** Entender completamente antes de actuar

**Cuándo usar:**
- Nueva feature
- Evaluar tecnologías
- Resolver problema complejo
- Antes de decisión arquitectónica

**Output:**
- Opciones evaluadas
- Recomendación justificada
- Riesgos identificados
- Referencias documentadas

### 02-planificacion.md

**Objetivo:** Dividir en tareas del tamaño de un "balde"

**Cuándo usar:**
- Después de investigación aprobada
- Feature con múltiples pasos
- Migración compleja
- Refactor grande

**Output:**
- Tareas < 4h cada una
- Dependencias claras
- Estimaciones realistas
- Riesgos por tarea

### 03-ejecucion.md

**Objetivo:** Implementar una tarea específica

**Cuándo usar:**
- Por cada tarea del plan
- Una conversación nueva por tarea
- Contexto mínimo necesario

**Output:**
- Tarea completada
- Tests pasando
- Commit individual
- Evidencia de éxito

## 🚀 Cómo Usar

### Opción A: Manual (Copy-Paste)

```bash
# 1. Copiar template
cp templates/workflows/01-investigacion.md mi-proyecto/investigacion-feature-x.md

# 2. Rellenar variables {VAR}
# Buscar y reemplazar:
# {TEMA} → "Sistema de notificaciones"
# {FECHA} → "2026-01-30"
# {PROYECTO} → "mi-app"

# 3. Pegar en conversación limpia con IA
# [Nueva conversación]
# [Pegar contenido del template]

# 4. El IA completa las secciones
```

### Opción B: Script Automatizado (Próxima versión)

```bash
# Generar workflow completo
npm run workflow:new "sistema de notificaciones"

# Output:
# workflows/notificaciones/
#   ├── 01-investigacion.md (pre-filled)
#   ├── 02-planificacion.md (ready)
#   └── 03-ejecucion-tasks/ (ready)
```

## 📊 Ejemplo Completo

### Feature: "Sistema de Comentarios"

#### Fase 1: Investigación (1 conversación)

```bash
# 1. Copiar template
cp templates/workflows/01-investigacion.md investigacion-comentarios.md

# 2. Variables reemplazadas:
# {TEMA} → "Sistema de comentarios"
# {PROYECTO} → "blog-app"
# Etc.

# 3. Nueva conversación con IA
[Pegar investigacion-comentarios.md]

# 4. IA investiga y completa:
# - Opciones: Disqus vs self-hosted vs Commento
# - Recomendación: Self-hosted (control total)
# - Riesgos: Spam, moderación

# 5. Revisar con Regla de los 5
# 6. Guardar investigacion-comentarios.md (aprobado)
```

#### Fase 2: Planificación (1 conversación NUEVA)

```bash
# 1. NUEVA conversación (balde limpio)
[Nueva conversación]

# 2. Copiar template
cp templates/workflows/02-planificacion.md planificacion-comentarios.md

# 3. Variables + contexto de investigación
# {TEMA} → "Sistema de comentarios"
# {OPCIÓN_SELECCIONADA} → "Self-hosted"
# Pegar resumen de investigación

# 4. IA genera plan:
# Tarea 1: DB schema (1h)
# Tarea 2: API POST /comments (2h)
# Tarea 3: API GET /comments (1h)
# Tarea 4: UI componente (2h)
# Tarea 5: Moderación (2h)
# Tarea 6: Tests (2h)

# 5. Revisar con Regla de los 5
# 6. Guardar planificacion-comentarios.md (aprobado)
```

#### Fase 3: Ejecución (6 conversaciones, una por tarea)

```bash
# Tarea 1 - NUEVA conversación
[Nueva conversación]

cp templates/workflows/03-ejecucion.md ejecucion-tarea1.md
# Variables:
# {N} → 1
# {NOMBRE} → "DB schema para comentarios"
# Contexto: resumen investigación + esta tarea del plan

# IA implementa → Validar → Commit
git commit -m "feat(comments): add DB schema"

# Tarea 2 - NUEVA conversación
[Nueva conversación]

cp templates/workflows/03-ejecucion.md ejecucion-tarea2.md
# Variables:
# {N} → 2
# {NOMBRE} → "API POST /comments"
# Contexto: mínimo necesario

# IA implementa → Validar → Commit
git commit -m "feat(comments): add POST endpoint"

# ... Repetir para tareas 3-6
```

## ✅ Ventajas de Este Approach

### 1. Baldes limpios

```
❌ Malo (1 conversación para todo):
[Conversación con 80 mensajes]
- Investigación mezclada con ejecución
- Contexto confuso
- IA se "pierde"

✅ Bueno (3+ conversaciones):
[Conversación 1: Investigación - 10 mensajes]
[Conversación 2: Planificación - 8 mensajes]
[Conversación 3: Tarea 1 - 5 mensajes]
[Conversación 4: Tarea 2 - 6 mensajes]
→ Cada una enfocada, contexto limpio
```

### 2. Revisión estructurada

Cada fase tiene checklist de Regla de los 5:
- Detectar problemas temprano
- Evitar trabajo inútil
- Calidad consistente

### 3. Reutilizable

Templates se convierten en biblioteca:
```bash
templates/workflows/
├── ejemplos/
│   ├── feature-auth-completo.md
│   ├── migracion-db-completo.md
│   └── refactor-api-completo.md
└── tuyos/
    ├── investigacion-{TU_FEATURE}.md
    └── planificacion-{TU_FEATURE}.md
```

## 🎨 Customización

### Agregar secciones específicas

Ejemplo: Proyecto con regulatory compliance

```markdown
# En 01-investigacion.md, agregar:

## 🔒 Compliance

**Regulaciones aplicables:**
- [ ] GDPR
- [ ] HIPAA
- [ ] SOC2

**Requisitos por regulación:**
...
```

### Crear templates específicos

```bash
templates/workflows/
├── 01-investigacion.md (genérico)
├── 01-investigacion-security.md (enfoque seguridad)
└── 01-investigacion-performance.md (enfoque performance)
```

## 📚 Referencias

- [Resonant Coding (skill)](../../skills/resonant-coding/SKILL.md)
- [Rule of Five (script)](../../scripts/rule-of-five.cjs)
- [Post original de Resonant Coding](https://charly-vibes.github.io/microdancing/es/posts/resonant-coding)

---

**Tips:**

💡 **Nombrar conversaciones claramente:**
```
Blog - Investigación: Comentarios
Blog - Plan: Comentarios
Blog - Ejecutar: Tarea 1 (DB schema)
Blog - Ejecutar: Tarea 2 (API POST)
```

💡 **Copiar solo contexto relevante entre fases:**
- Investigación → Planificación: Resumen ejecutivo (no todo)
- Planificación → Ejecución: Tarea específica (no plan completo)

💡 **Guardar documentos aprobados:**
```bash
mkdir -p docs/workflows/comentarios/
cp investigacion-comentarios.md docs/workflows/comentarios/
cp planificacion-comentarios.md docs/workflows/comentarios/
# Referencia futura + onboarding
```

---

*Templates v1.0.0 - agent-automatizado*
