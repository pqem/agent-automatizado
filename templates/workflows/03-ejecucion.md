# Ejecución: Tarea #{N} - {NOMBRE}

**Fecha:** {FECHA}
**Proyecto:** {PROYECTO}
**Conversación:** #{N+2} - El Ejecutor (Balde limpio)

---

## 🎯 Esta Tarea

**De:** Plan de {TEMA}
**Tarea #{N}:** {NOMBRE_DESCRIPTIVO}
**Estimación:** {HORAS}h

## 📋 Contexto Mínimo

### De la Investigación

**Decisión:** {OPCIÓN_SELECCIONADA}

**Razón principal:** {JUSTIFICACIÓN_CORTA}

### Del Plan

**Objetivo de esta tarea:**
{QUÉ_DEBE_LOGRAR}

**Archivos a modificar:**
- `{ARCHIVO_1}`
- `{ARCHIVO_2}`

**Dependencias completadas:**
- [x] Tarea #{N-1}: {NOMBRE}

## ✅ Criterios de Éxito

Esta tarea está completa cuando:

- [ ] {CRITERIO_1}
- [ ] {CRITERIO_2}
- [ ] {CRITERIO_3}
- [ ] Tests pasando (si aplica)
- [ ] Sin warnings/errores
- [ ] Código formateado

## 🔧 Implementación

### Paso 1: {NOMBRE_PASO}

**Qué hacer:**
```
{DESCRIPCIÓN_DETALLADA}
```

**Código/Comando:**
```{LENGUAJE}
{CÓDIGO_O_COMANDO}
```

**Validación:**
```bash
{COMANDO_PARA_VALIDAR}
```

**Resultado esperado:**
```
{OUTPUT_ESPERADO}
```

---

### Paso 2: {NOMBRE_PASO}

[Repetir estructura]

---

## 🧪 Testing

### Test Manual

```bash
# Pasos para probar manualmente
{PASO_1}
{PASO_2}
{PASO_3}
```

**Resultado esperado:**
```
{DESCRIPCIÓN_DE_ÉXITO}
```

### Test Automatizado (si aplica)

**Archivo:** `{PATH_AL_TEST}`

```{LENGUAJE}
{CÓDIGO_DEL_TEST}
```

**Ejecutar:**
```bash
{COMANDO_PARA_CORRER_TESTS}
```

## 📸 Evidencia

### Antes de los cambios

```
[Screenshot/Output/Estado antes]
```

### Después de los cambios

```
[Screenshot/Output/Estado después]
```

### Diff principal

```diff
{GIT_DIFF_RELEVANTE}
```

## ⚠️ Problemas Encontrados

### Issue #1: {DESCRIPCIÓN}

**Síntoma:**
```
{ERROR_O_COMPORTAMIENTO}
```

**Causa:**
{EXPLICACIÓN}

**Solución:**
```{LENGUAJE}
{CÓDIGO_O_FIX}
```

**Tiempo perdido:** {MINUTOS}min

---

## ✅ Revisión (Regla de los 5)

### 1. Borrador - ¿Está todo?

- [ ] Toda la funcionalidad de la tarea implementada
- [ ] No faltan casos de uso
- [ ] Tests incluidos

### 2. Corrección - ¿Es correcto?

- [ ] Lógica es correcta
- [ ] No hay bugs obvios
- [ ] Tests pasan

**Checks automáticos:**
```bash
npm run lint           # ✅ Sin errores
npm test              # ✅ Todos pasan
npm run type-check    # ✅ Sin errores de tipos
```

### 3. Claridad - ¿Se entiende?

- [ ] Código es legible
- [ ] Nombres descriptivos
- [ ] Comentarios donde es necesario
- [ ] Sin "magia" sin explicar

**Complejidad:**
```bash
# Si tienes herramientas de complejidad:
complexity src/file.js
# Complejidad ciclomática < 10 ✅
```

### 4. Casos Límite - ¿Qué podría fallar?

- [ ] Inputs inválidos manejados
- [ ] Errores tienen try-catch
- [ ] Edge cases cubiertos en tests

**Casos probados:**
- ✅ Input válido
- ✅ Input vacío
- ✅ Input null/undefined
- ✅ Input extremadamente grande
- ✅ Network failure (si aplica)

### 5. Excelencia - ¿Es lo mejor posible?

- [ ] Performance aceptable
- [ ] Código mantenible
- [ ] Documentado
- [ ] Sigue convenciones del proyecto

**Optimizaciones aplicadas:**
- {OPTIMIZACIÓN_1}
- {OPTIMIZACIÓN_2}

## 📝 Commit

### Mensaje

```
{TIPO}({SCOPE}): {DESCRIPCIÓN_CORTA}

{CUERPO_DETALLADO}

Tarea #{N} de {TOTAL}
Estimado: {HORAS}h | Real: {HORAS_REALES}h
```

### Archivos

```bash
git add {ARCHIVOS}
git commit -F commit-msg.txt
```

### Validación pre-push

```bash
npm run validate    # ✅ Pasa
git push
```

## 🎯 Estado del Plan

| Tarea | Estado | Tiempo |
|-------|--------|--------|
| 1 | ✅ Completa | 2h |
| 2 | ✅ Completa | 3h |
| **3** | **✅ Completa** | **{HORAS_REALES}h** |
| 4 | ⏸️ Siguiente | - |
| 5 | 📋 Pendiente | - |

**Progreso:** {N}/{TOTAL} tareas ({PORCENTAJE}%)

**Tiempo acumulado:** {HORAS_TOTAL}h / {ESTIMADO_TOTAL}h

## 🚀 Próxima Tarea

**Tarea #{N+1}:** {NOMBRE_SIGUIENTE_TAREA}

**Preparación:**
1. Nueva conversación (balde limpio)
2. Copiar contexto mínimo de esta tarea si relevante
3. Usar template 03-ejecucion.md
4. Ejecutar

**Dependencias:**
- [x] Tarea #{N} (esta) completada

```bash
# [Nueva conversación]
# Contexto: Tarea #{N+1} del plan {TEMA}
# {DESCRIPCIÓN_TAREA_SIGUIENTE}
```

---

## 📚 Referencias Útiles

- [Documentación relevante]({URL})
- [Issue relacionado]({URL})
- [PR de referencia]({URL})

---

*Template generado por agent-automatizado*
*Versión: 1.0.0*
