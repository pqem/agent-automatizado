---
name: resonant-coding
description: Metodología completa de Resonant Coding - Regla de los 5, baldes limpios, tres expertos
scope: root
metadata:
  auto_invoke:
    - "resonant"
    - "regla de los 5"
    - "rule of five"
    - "baldes limpios"
    - "revisar"
    - "refinar"
    - "mejorar calidad"
    - "review completo"
allowed_tools: [read, write, memory_search, exec]
---

# Resonant Coding

Metodología para trabajar efectivamente con LLMs evitando el caos y maximizando la calidad.

## 🎯 Problema que resuelve

Usar IA para "acelerar" suele generar:
- ❌ Código difícil de entender
- ❌ Calidad inconsistente
- ❌ Revisiones interminables
- ❌ **Resultado:** MÁS LENTO, no más rápido

**Causa raíz:** No entender cómo funcionan los LLMs.

## 🧠 Cómo funcionan los LLMs

### 4 verdades fundamentales

1. **Son predictores de texto**
   - Como autocompletado del celular, pero masivo
   - No "piensan", predicen siguiente token probable

2. **No tienen memoria real**
   - Cada conversación es "nueva"
   - La "memoria" es pegar contexto anterior

3. **Atención limitada**
   - Textos largos → peor resultado
   - Capacidad de contexto finita

4. **No son deterministas**
   - Misma pregunta → diferentes respuestas
   - Temperatura > 0 = variabilidad

### La metáfora del balde

**Lavando platos en el río con un balde:**

| Platos | Estado del agua | Resultado |
|--------|-----------------|-----------|
| 1 | Limpia, sobra | ✅ Óptimo |
| 10 | Turbia | ⚠️ Cuidado |
| 100 | Muy sucia | ❌ Empeoran |
| Algo grasoso | Inutilizable | 💀 Destruido |

**En IA:**
- Conversación corta + enfocada = balde limpio = respuesta excelente
- Conversación larga + desordenada = agua sucia = basura

**Resonancia** = Info que das ≈ Capacidad de atención del modelo

## 📏 Regla de los 5

Proceso iterativo de refinamiento en 5 filtros sucesivos.

### Los 5 filtros

#### 1️⃣ Borrador
**Objetivo:** Crear contenido inicial completo

```
Pregunta clave: ¿Está TODO lo necesario?

✅ Preferir amplitud a profundidad
✅ No importa que sea perfecto
❌ No omitir partes "obvias"
```

**Ejemplo:**
```
❌ Malo: "Agregar autenticación"

✅ Bueno: 
- Instalar dependencias (jwt, bcrypt)
- Endpoint /login
- Middleware auth
- Rutas protegidas /dashboard
- Tests
```

#### 2️⃣ Corrección
**Objetivo:** Arreglar errores e inconsistencias

```
Pregunta clave: ¿Es CORRECTO?

✅ Verificar datos/hechos
✅ Chequear lógica
✅ Buscar contradicciones
❌ No asumir que el modelo "sabe"
```

**Ejemplo:**
```
Borrador: "Instalar express-jwt"

Corrección: 
⚠️  express-jwt está deprecated
✅ Usar jsonwebtoken directamente
```

#### 3️⃣ Claridad
**Objetivo:** Simplificar y hacer entendible

```
Pregunta clave: ¿Se entiende a la PRIMERA?

✅ Eliminar jerga innecesaria
✅ Explicar conceptos complejos
✅ Estructura lógica clara
❌ No asumir conocimiento previo
```

**Ejemplo:**
```
❌ Turbio:
"Implementar JWT stateless con RS256"

✅ Claro:
"Sistema de autenticación con tokens:
- Token = pase temporal (expira en 1h)
- Usuario lo envía en cada request
- Servidor verifica sin consultar DB (stateless)"
```

#### 4️⃣ Casos Límite
**Objetivo:** Identificar qué podría salir mal

```
Pregunta clave: ¿Qué pasa si...?

✅ Inputs inválidos
✅ Condiciones inesperadas
✅ Estados edge
❌ No asumir "camino feliz"
```

**Ejemplo:**
```
Autenticación JWT:

Casos límite:
- ¿Token alterado? → Validación con secret
- ¿Token expirado? → Refresh token
- ¿Usuario cambia password? → Invalidar tokens
- ¿Logout? → Blacklist
- ¿Rate limiting? → 3 intentos/min
```

#### 5️⃣ Excelencia
**Objetivo:** Optimizar y pulir

```
Pregunta clave: ¿Es lo MEJOR que puede ser?

✅ Performance
✅ Mantenibilidad
✅ Documentación
✅ Tests
❌ No conformarse con "aceptable"
```

**Ejemplo:**
```
Mejoras:
- Variables de entorno para secrets ✅
- Tests unitarios + integration ✅
- Rate limiting en endpoints críticos ✅
- Logging de intentos fallidos ✅
- Documentación en README ✅
```

### Orden flexible

**NO es secuencial rígido:**
- A veces necesitas más Claridad que Corrección
- Algunos documentos requieren 3 iteraciones de Casos Límite
- Usa como guía, no como ley

### Aplicación iterativa

```
Borrador v1 → Corrección → Borrador v2 → Claridad → ...

El punto es tener ESTRUCTURA, no seguir ciegamente.
```

## 🎭 Los Tres Expertos

Dividir el trabajo en 3 conversaciones independientes (baldes limpios).

### El Investigador (Conversación 1)

**Objetivo:** Entender el problema

```markdown
Contexto limpio: SOLO sobre investigación

Tareas:
1. Leer lo que existe
2. Identificar partes clave
3. Sintetizar información
4. Proponer opciones

Aplicar Regla de los 5 al resumen
```

**Prompt template:**

```
Actuá como experto en [TEMA].

Investigá:
1. ¿Qué existe actualmente en el proyecto?
2. ¿Qué soluciones hay disponibles?
3. ¿Cuáles son las opciones?
4. ¿Ventajas/desventajas de cada una?

Generá un resumen estructurado.
```

**Output esperado:**
- Documento de investigación (2-5 páginas)
- Opciones evaluadas
- Recomendación justificada

**⚠️ CRÍTICO:** Revisión humana exhaustiva
- El modelo NO sabe conocimiento implícito del equipo
- Validar recomendaciones con experiencia real

### La Estratega (Conversación 2)

**Objetivo:** Planificar paso a paso

```markdown
Contexto limpio: Resumen investigación + objetivo

Tareas:
1. Dividir en tareas PEQUEÑAS
2. Identificar dependencias
3. Estimar complejidad
4. Detectar riesgos

Aplicar Regla de los 5 al plan
```

**Prompt template:**

```
Con base en esta investigación:
[PEGAR RESUMEN]

Genera plan paso a paso donde:
- Cada tarea cabe en un "balde" (< 4h)
- Tareas son independientes si es posible
- Dependencias están claras
- Riesgos identificados
```

**Validación de tareas:**

```
❌ Tarea muy grande:
"Implementar sistema de autenticación completo"

✅ Tareas del tamaño correcto:
1. "Crear schema de usuarios en DB" (1h)
2. "Endpoint POST /register con validación" (2h)
3. "Endpoint POST /login que retorna JWT" (2h)
4. "Middleware de autenticación" (1h)
5. "Tests de endpoints auth" (2h)
```

**Output esperado:**
- Plan detallado con tareas numeradas
- Estimaciones realistas
- Mapa de dependencias
- Riesgos identificados

### El Ejecutor (Conversaciones 3+)

**Objetivo:** Implementar cada tarea

```markdown
Una conversación por tarea (balde limpio)

Contexto: Plan completo + tarea específica

Tareas:
1. Implementar según plan
2. Validar resultado
3. Documentar cambios

Aplicar Regla de los 5 al código
```

**Prompt template:**

```
Implementá esta tarea del plan:

Tarea #[N]: [DESCRIPCIÓN]

Contexto necesario:
[PEGAR SOLO INFO RELEVANTE]

Requisitos:
- Seguir convenciones del proyecto
- Incluir tests
- Documentar cambios
```

**Por cada tarea:**
1. Nueva conversación (balde limpio)
2. Contexto mínimo relevante
3. Implementación
4. Validación
5. Commit

## 🔄 Workflow completo

### Ejemplo: Feature "Sistema de notificaciones"

#### 📋 Fase 1: Investigación

```bash
# 1. Conversación limpia
[Nueva conversación]

# 2. Prompt al Investigador
"Actuá como experto en notificaciones push.

Investigá para mi app:
1. ¿Qué servicios existen? (Firebase, OneSignal, etc.)
2. ¿Qué tenemos implementado?
3. ¿Cuál recomendás y por qué?
4. ¿Complejidad y costos?

Genera resumen estructurado."

# 3. Output del modelo
[Documento de investigación]

# 4. Revisar con Regla de los 5
✅ Borrador: Completo (3 servicios evaluados)
⚠️  Corrección: OneSignal pricing desactualizado
✅ Claridad: Se entiende bien
⚠️  Casos límite: Falta considerar iOS vs Android
✅ Excelencia: Recomendación justificada

# 5. Refinar y aprobar
[Documento investigación FINAL]
```

#### 📐 Fase 2: Planificación

```bash
# 1. NUEVA conversación (balde limpio)
[Nueva conversación]

# 2. Prompt a la Estratega
"Con base en esta investigación:
[PEGAR RESUMEN APROBADO]

Genera plan paso a paso.
Requisito: cada tarea < 4h, lo más pequeña posible."

# 3. Output del modelo
Plan con 8 tareas pequeñas

# 4. Revisar con Regla de los 5
✅ Borrador: 8 tareas definidas
✅ Corrección: Lógica correcta
⚠️  Claridad: Tarea 3 poco clara → refinar
✅ Casos límite: Certificados iOS considerados
⚠️  Excelencia: Falta estimación → agregar

# 5. Plan FINAL aprobado
```

#### ⚡ Fase 3: Ejecución

```bash
# Por cada tarea (8 conversaciones)

# Tarea 1: Setup Firebase
[Nueva conversación]
Contexto: Plan + tarea 1
→ Implementar
→ Validar
→ Commit: "feat(notifications): setup Firebase"

# Tarea 2: Backend endpoints
[Nueva conversación]
Contexto: Plan + tarea 2
→ Implementar
→ Validar
→ Commit: "feat(notifications): add send endpoint"

# ... Tarea 3-8 ...
```

**Cada tarea:**
- Balde limpio (nueva conversación)
- Contexto mínimo
- Regla de los 5 aplicada
- Commit individual

## 🎨 El arte de preguntar

La calidad de la respuesta depende de la calidad de la pregunta.

### Anatomía de una buena pregunta

```
❌ Pregunta vaga:
"Ayudame con notificaciones"

✅ Pregunta específica:
"Necesito implementar notificaciones push para app móvil (iOS + Android).

Contexto:
- Ya tenemos Firebase Analytics
- 10K usuarios activos
- Necesitamos: eventos en tiempo real + marketing

Dame recomendación justificada entre:
- Firebase Cloud Messaging
- OneSignal
- Pusher

Considerá: costo, complejidad setup, features."
```

### Template SBAR (Situation-Background-Assessment-Recommendation)

```markdown
**Situation** (Situación actual)
Necesito [OBJETIVO]

**Background** (Contexto relevante)
- Proyecto: [TIPO]
- Stack actual: [TECNOLOGÍAS]
- Restricciones: [LÍMITES]

**Assessment** (Lo que sé/intenté)
- Ya investigué: [X, Y]
- Probé: [Z] pero [PROBLEMA]

**Recommendation** (Qué necesito)
Dame [TIPO DE OUTPUT] que incluya [REQUISITOS]
```

### Ejemplo real SBAR

```markdown
**Situation**
Necesito agregar caché a API REST

**Background**
- API Node.js + Express
- 50 requests/sec promedio
- Redis ya configurado (analytics)
- Endpoints más lentos: /users, /posts

**Assessment**
- Sé que necesito TTL diferentes por endpoint
- Probé cache-manager pero config compleja
- Middleware approach parece mejor

**Recommendation**
Dame implementación de:
1. Middleware de caché con Redis
2. Configuración por endpoint (TTL)
3. Invalidación en POST/PUT/DELETE
4. Tests de integración
```

## 🎯 Checklist de uso

Antes de aceptar un output del modelo:

```
📋 Regla de los 5:
□ ¿Es completo? (Borrador)
□ ¿Es correcto? (Corrección)
□ ¿Se entiende? (Claridad)
□ ¿Qué podría fallar? (Casos límite)
□ ¿Es lo mejor posible? (Excelencia)

🪣 Baldes limpios:
□ ¿Conversación enfocada en UN tema?
□ ¿Contexto relevante SOLO para esta tarea?
□ ¿Sin info contradictoria/obsoleta?

👥 Tres expertos:
□ ¿Investigación revisada por humano?
□ ¿Plan con tareas < 4h?
□ ¿Una conversación por tarea de ejecución?

📊 Optimización:
□ ¿Pregunta bien formulada?
□ ¿Contexto mínimo necesario?
□ ¿Output reutilizable como plantilla?
```

## 💡 Tips prácticos

### Reutilizar outputs como plantillas

Cada vez que obtienes un output bueno (pasó Regla de los 5), guárdalo:

```bash
# Ejemplo: Plan de migración de DB quedó excelente
cp planificacion-migracion.md templates/workflows/migracion-db.md

# Próxima vez:
# Solo cambiar variables específicas del proyecto
```

### Mantener biblioteca de prompts

```
prompts/
├── investigacion-tecnologia.md
├── planificacion-feature.md
├── debug-error.md
└── refactor-codigo.md
```

### Nombrar conversaciones

Cuando trabajes en herramienta con múltiples conversaciones:

```
Investigador: [PROYECTO] - Investigación
Estratega: [PROYECTO] - Plan
Ejecutor T1: [PROYECTO] - Tarea 1
Ejecutor T2: [PROYECTO] - Tarea 2
...
```

Ayuda a mantener claro qué balde es cuál.

## ⚠️ Trampas comunes

### 1. "Conversación única para todo"

```
❌ Malo:
[Conversación con 50 mensajes]
- Investigación
- Planificación
- Ejecución
- Debugging
- Refactor
→ Balde SUCIO, outputs confusos

✅ Bueno:
[5 conversaciones separadas]
Cada una con propósito claro
→ Baldes LIMPIOS, outputs excelentes
```

### 2. "Aceptar primera respuesta"

```
❌ Malo:
Prompt → Output → Usar directamente

✅ Bueno:
Prompt → Output → Regla de los 5 → Refinar → Usar
```

### 3. "Tareas muy grandes"

```
❌ Malo:
Tarea: "Implementar todo el sistema de usuarios"
→ No cabe en un balde

✅ Bueno:
Tarea 1: "Schema de users en DB"
Tarea 2: "Endpoint POST /register"
Tarea 3: "Endpoint POST /login"
→ Cada una cabe en un balde
```

### 4. "Contexto excesivo"

```
❌ Malo:
[Pegar todo el código del proyecto]

✅ Bueno:
[Pegar SOLO archivos relevantes para esta tarea]
```

### 5. "No revisar conocimiento implícito"

```
❌ Malo:
Investigación: "Firebase es lo mejor"
Aceptar sin revisar

✅ Bueno:
Investigación: "Firebase es lo mejor"
Revisar: "Pero nosotros ya tenemos Pusher configurado"
→ Decisión informada
```

## 📚 Referencias

- Post original de Resonant Coding: https://charly-vibes.github.io/microdancing/es/posts/resonant-coding
- Context Engineering: https://github.com/humanlayer/advanced-context-engineering-for-coding-agents
- Regla de los 5 (Steve Yegge): https://github.com/steveyegge/gastown/blob/main/internal/formula/formulas/rule-of-five.formula.toml

---

**Meta:** Esta skill fue creada usando la metodología que describe. 🐕
