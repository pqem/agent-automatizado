# Planificación: {TEMA}

**Fecha:** {FECHA}
**Proyecto:** {PROYECTO}
**Conversación:** #2 - La Estratega (Balde limpio)

---

## 🎯 Objetivo

Dividir {TEMA} en tareas pequeñas y ejecutables.

## 📋 Contexto (desde Investigación)

**Decisión tomada:** {OPCIÓN_SELECCIONADA}

**Justificación resumida:**
- {RAZÓN_PRINCIPAL}

**Riesgos conocidos:**
- {RIESGO_1}
- {RIESGO_2}

## 🗺️ Plan de Implementación

### Principio: Tareas del tamaño de un "balde"

Cada tarea debe:
- ✅ Caber en < 4 horas
- ✅ Ser lo más independiente posible
- ✅ Tener output verificable
- ❌ NO requerir múltiples conversaciones

### Tareas

#### Tarea 1: {NOMBRE_DESCRIPTIVO}

**Descripción:**
{QUÉ_HACE}

**Archivos afectados:**
- `{ARCHIVO_1}`
- `{ARCHIVO_2}`

**Dependencias:**
- [ ] Ninguna (puede empezar inmediatamente)
- [ ] Requiere: Tarea #{N}

**Estimación:** {HORAS}h

**Output verificable:**
- [ ] {CRITERIO_1}
- [ ] {CRITERIO_2}

**Riesgos específicos:**
- {RIESGO} → {MITIGACIÓN}

---

#### Tarea 2: {NOMBRE_DESCRIPTIVO}

**Descripción:**
{QUÉ_HACE}

**Archivos afectados:**
- `{ARCHIVO_1}`
- `{ARCHIVO_2}`

**Dependencias:**
- [ ] Requiere: Tarea #1

**Estimación:** {HORAS}h

**Output verificable:**
- [ ] {CRITERIO_1}
- [ ] {CRITERIO_2}

**Riesgos específicos:**
- {RIESGO} → {MITIGACIÓN}

---

#### Tarea 3: {NOMBRE_DESCRIPTIVO}

[Repetir estructura para todas las tareas]

---

## 📊 Mapa de Dependencias

```
Tarea 1 (Setup)
  ↓
Tarea 2 (Core) ←─┐
  ↓              │
Tarea 3 (Feature A) → Tarea 5 (Integration)
  ↓              ↑
Tarea 4 (Feature B) ─┘
  ↓
Tarea 6 (Tests)
  ↓
Tarea 7 (Docs)
```

**Camino crítico:** 1 → 2 → 3 → 5 → 6 → 7

**Tareas en paralelo posible:**
- Tarea 3 y 4 (después de Tarea 2)

## ⏱️ Estimación Total

| Fase | Tareas | Tiempo estimado |
|------|--------|----------------|
| **Setup** | 1 | {HORAS}h |
| **Core** | 2-4 | {HORAS}h |
| **Integration** | 5 | {HORAS}h |
| **Validación** | 6 | {HORAS}h |
| **Docs** | 7 | {HORAS}h |
| **TOTAL** | 7 | **{TOTAL}h** |

**Con buffer 20%:** {TOTAL_CON_BUFFER}h (~{DÍAS} días)

## ⚠️ Riesgos y Contingencias

### Riesgo 1: {DESCRIPCIÓN}

**Probabilidad:** Alta/Media/Baja
**Impacto:** Alto/Medio/Bajo

**Plan de mitigación:**
- {ACCIÓN_1}
- {ACCIÓN_2}

**Plan de contingencia (si ocurre):**
1. {PASO_1}
2. {PASO_2}

**Tiempo buffer:** +{HORAS}h

---

### Riesgo 2: {DESCRIPCIÓN}

[Repetir estructura]

---

## 📋 Checklist Pre-Ejecución

Antes de empezar las tareas, verificar:

- [ ] Todas las tareas son < 4h
- [ ] No hay tareas que puedan dividirse más
- [ ] Dependencias están claras
- [ ] Output verificable definido para cada tarea
- [ ] Riesgos identificados con planes
- [ ] Estimación incluye buffer realista

## ✅ Revisión (Regla de los 5)

- [ ] **Borrador:** ¿Todas las tareas necesarias están? (nada falta)
- [ ] **Corrección:** ¿Estimaciones realistas? ¿Dependencias correctas?
- [ ] **Claridad:** ¿Cada tarea es clara y específica?
- [ ] **Casos Límite:** ¿Qué puede salir mal en cada tarea?
- [ ] **Excelencia:** ¿Es el mejor plan posible?

### Validación de tamaño de tareas

**Test del "balde":**

```
❌ Tarea muy grande:
"Implementar sistema de autenticación completo"
→ Múltiples conversaciones necesarias

✅ Tareas del tamaño correcto:
"Crear schema users en DB" (1h)
"Endpoint POST /register con validación" (2h)
"Endpoint POST /login que retorna JWT" (2h)
"Middleware de autenticación" (1h)
"Tests de endpoints auth" (2h)
→ Cada una cabe en un balde
```

### Issues encontrados en revisión

```
[Documentar aquí issues y resoluciones]
```

## 🚀 Siguiente Paso

Una vez aprobado el plan:

**Para cada tarea:**
1. Crear nueva conversación (balde limpio)
2. Copiar contexto mínimo:
   - Resumen investigación
   - Esta tarea específica del plan
   - Archivos relevantes
3. Ejecutar
4. Validar con criterios de output
5. Commit
6. Pasar a siguiente tarea

```bash
# Ejemplo para Tarea 1
# [Nueva conversación]
# 
# Contexto:
# Investigación: Usaremos Firebase para notificaciones
# Tarea 1: Setup Firebase en proyecto
# - Crear proyecto en Firebase Console
# - Descargar google-services.json
# - Configurar en app
# Output: Firebase configurado, test de conexión pasa
#
# ¿Empezamos?
```

---

*Template generado por agent-automatizado*
*Versión: 1.0.0*
