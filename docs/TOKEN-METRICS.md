# Token Metrics - Tracking & Optimización

Sistema de tracking de uso de tokens para ser estratégico con recursos limitados.

## 🎯 ¿Por qué trackear tokens?

### El problema

**Los tokens NO son infinitos:**
- Cupos mensuales limitados (empresas)
- Costos reales por uso (freelancers)
- Performance degrada con contextos grandes
- Decisiones de qué preguntar al IA importan

### La solución

Trackear uso permite:
- ✅ Saber dónde gastas más
- ✅ Detectar patrones ineficientes
- ✅ Optimizar operaciones costosas
- ✅ Proyectar costos mensuales
- ✅ Justificar presupuesto

## 📊 Comandos

### Ver reporte

```bash
npm run tokens:report

# Output:
📊 Token Usage Report
💰 Costo total: $2.15
🎯 Presupuesto: $50.00
📈 Uso: 4.3%

🔝 Top operaciones:
1. Investigación arquitectura ($0.89, 15K tokens)
2. Code review completo ($0.67, 11K tokens)
...

💡 Recomendaciones:
- Usar conversaciones limpias (ahorro: ~$0.50)
- Crear skill para code review (ahorro: ~30%)
```

### Trackear operación

```bash
npm run tokens:track "nombre-operacion" "input-text" "output-text" [modelo]

# Ejemplo manual:
npm run tokens:track "investigación" "$(cat input.txt)" "$(cat output.txt)" claude-sonnet-4
```

### Configurar presupuesto

```bash
npm run tokens:budget 100

# Con threshold custom:
npm run tokens:budget 100 80  # Warning a los $80
```

### Reset mensual

```bash
npm run tokens:reset

# Guarda backup: .token-metrics-2026-01.json
# Inicia métricas frescas para nuevo mes
```

## 🔧 Integración con IA

### Tracking manual

Después de operación importante:

```bash
# Guardá input y output
echo "tu prompt largo" > input.txt
echo "respuesta del IA" > output.txt

# Track
npm run tokens:track "feature-X-investigacion" "$(cat input.txt)" "$(cat output.txt)"
```

### Tracking automático (opcional)

Si usas wrapper de IA:

```javascript
// wrapper.js
async function askAI(prompt) {
  const response = await llm.generate(prompt)
  
  // Auto-track
  const { execSync } = require('child_process')
  execSync(`npm run tokens:track "auto" "${prompt}" "${response.text}"`, {
    cwd: process.cwd(),
    stdio: 'ignore'
  })
  
  return response
}
```

## 📈 Métricas y Precios

### Modelos soportados

| Modelo | Input ($/1K) | Output ($/1K) | Uso recomendado |
|--------|--------------|---------------|-----------------|
| **claude-sonnet-4** | $0.003 | $0.015 | ✅ Default (balance) |
| claude-opus-4 | $0.015 | $0.075 | Solo tareas complejas |
| gpt-4-turbo | $0.01 | $0.03 | Alternativa |
| gpt-3.5-turbo | $0.0005 | $0.0015 | Tareas simples |
| gemini-pro | $0.0005 | $0.0015 | Alternativa barata |

### Estimación de tokens

**Método automático:**
- 1 token ≈ 0.75 palabras (español)
- 1 token ≈ 4 caracteres

**Script usa promedio de ambos métodos**

### Ejemplo de costos

```
Operación típica:
- Input: 5,000 tokens (1,250 palabras)
- Output: 2,000 tokens (500 palabras)
- Total: 7,000 tokens

Con Claude Sonnet 4:
- Input: 5K × $0.003 = $0.015
- Output: 2K × $0.015 = $0.030
- Total: $0.045
```

## 💡 Recomendaciones

### 1. Conversaciones Limpias

**❌ Malo (contexto sucio):**
```
Conversación de 50 mensajes
- 80,000 tokens acumulados
- Costo: ~$1.20
```

**✅ Bueno (baldes limpios):**
```
5 conversaciones de 10 mensajes c/u
- 20,000 tokens total
- Costo: ~$0.30
- Ahorro: 75%
```

**Acción:**
```bash
npm run clean:context "tarea específica"
# Genera contexto mínimo para nueva conversación
```

### 2. Skills para Operaciones Repetitivas

Si el reporte muestra:
```
💡 Operaciones repetitivas:
- code review (8x)
- documentación (6x)
- testing (5x)
```

**Acción:**
```bash
# Crear skill una vez
npm run add-skill code-review

# Ahorras contexto en futuras operaciones
# 30-50% menos tokens por operación
```

### 3. Modelo Correcto para la Tarea

| Tarea | Modelo | Por qué |
|-------|--------|---------|
| Investigación profunda | claude-opus-4 | Vale el costo |
| Planificación | claude-sonnet-4 | Balance perfecto |
| Código simple | claude-sonnet-4 | Suficientemente bueno |
| Refactor trivial | gpt-3.5-turbo | 10x más barato |
| Documentación | gemini-pro | Barato y efectivo |

### 4. Timing de Operaciones

**Mañana (presupuesto fresco):**
- Tareas complejas
- Investigaciones
- Decisiones arquitectónicas

**Final de mes (presupuesto bajo):**
- Solo lo esencial
- Usar skills existentes
- Modelos más baratos

## 📊 Interpretando el Reporte

### Uso Saludable

```
📈 Uso: 40% (día 15 del mes)
→ Proyección: ~80% fin de mes
→ ✅ Dentro de presupuesto
```

### Warning Signs

```
📈 Uso: 60% (día 10 del mes)
→ Proyección: 180% fin de mes
→ ⚠️ Reducir uso o aumentar presupuesto
```

### Recomendaciones Comunes

#### "Operaciones con > 10K tokens input"

**Causa:** Conversaciones muy largas

**Solución:**
```bash
# En lugar de 1 conversación larga:
npm run clean:context "implementar feature"
# Nueva conversación con contexto mínimo
```

#### "Operaciones repetitivas detectadas"

**Causa:** Mismo tipo de pregunta múltiples veces

**Solución:**
```bash
# Crear skill permanente:
npm run add-skill nombre-operacion
# Usar skill reduce contexto ~30%
```

#### "Uso de modelos caros"

**Causa:** Opus/GPT-4 para tareas simples

**Solución:**
- Opus solo para: arquitectura, decisiones críticas
- Sonnet para: 90% del trabajo diario
- Turbo para: refactors, docs simples

## 🔍 Análisis Avanzado

### Por tipo de operación

```bash
# Ver breakdown manual
cat .token-metrics.json | jq '.operations | group_by(.operation) | map({op: .[0].operation, count: length, total_cost: (map(.cost) | add)})'
```

### Eficiencia por modelo

```bash
# Comparar modelos
cat .token-metrics.json | jq '.operations | group_by(.model) | map({model: .[0].model, avg_cost: (map(.cost) | add / length)})'
```

### Tendencia temporal

```bash
# Últimos 7 días
node -e "
const m = require('./.token-metrics.json');
const week = Date.now() - 7*24*60*60*1000;
const ops = m.operations.filter(o => o.timestamp > week);
console.log('Última semana:', ops.reduce((s,o) => s + o.cost, 0).toFixed(2), 'USD');
"
```

## 🎯 Casos de Uso

### Caso 1: Freelancer con presupuesto limitado

**Setup:**
```bash
npm run tokens:budget 20  # $20/mes
```

**Workflow:**
- Revisar reporte diariamente
- Usar conversaciones limpias siempre
- Crear skills para operaciones comunes
- Modelo: claude-sonnet-4 (default)

**Resultado esperado:** 15-18 USD/mes

---

### Caso 2: Equipo con cupo corporativo

**Setup:**
```bash
npm run tokens:budget 200  # Cupo del equipo
```

**Workflow:**
- Revisar reporte semanalmente
- Identificar miembros con uso alto
- Entrenar en conversaciones limpias
- Auditar operaciones costosas

**Resultado esperado:** Optimización 20-30%

---

### Caso 3: Proyecto intensivo temporal

**Setup:**
```bash
npm run tokens:budget 500  # Proyecto 1 mes
```

**Workflow:**
- Fase investigación: Opus (no escatimar)
- Fase implementación: Sonnet
- Fase testing: Turbo
- Track por fase

**Post-mortem:**
```bash
npm run tokens:report > proyecto-X-tokens.txt
# Análisis para futuros proyectos
```

## 🚨 Troubleshooting

### "No hay operaciones registradas"

**Causa:** Nunca se trackeó nada

**Solución:**
```bash
# Trackear operaciones importantes manualmente
npm run tokens:track "operacion" "input" "output"

# O integrar en workflow automático
```

### "Proyección excede presupuesto"

**Acciones inmediatas:**
1. Usar conversaciones limpias
2. Crear skills para repetitivos
3. Cambiar a modelo más barato
4. Reducir complejidad de prompts

**Largo plazo:**
- Aumentar presupuesto
- Mejor planeación de operaciones
- Training del equipo

### "Estimación de tokens inexacta"

**Causa:** Método es aproximación

**Solución:**
- Es suficiente para tendencias
- Para precisión: usar API de provider
- Método es ~10% de error

## 📚 Referencias

- [Resonant Coding Skill](../skills/resonant-coding/SKILL.md) - Metodología completa
- [Pricing de Claude](https://www.anthropic.com/pricing)
- [Pricing de OpenAI](https://openai.com/pricing)
- [New Conversation Script](../scripts/new-conversation.cjs) - Baldes limpios

---

**Filosofía:** Los tokens son un recurso. Usarlos bien no es tacañería, es estrategia.
