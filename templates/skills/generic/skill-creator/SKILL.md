---
name: skill-creator
description: Crear nuevas skills. Usa cuando necesites crear una skill personalizada para el proyecto.
scope: root
tools: [read, write]
---

# Crear Nueva Skill

## Estructura de una Skill

```
skills/
└── nombre-skill/
    ├── SKILL.md         # Requerido: instrucciones
    ├── scripts/         # Opcional: scripts ejecutables
    ├── templates/       # Opcional: plantillas de código
    └── examples/        # Opcional: ejemplos
```

## Template de SKILL.md

```markdown
---
name: nombre-skill
description: Descripción breve. Incluir triggers: "Usa cuando X, Y, Z"
scope: root|ui|api|sdk
tools: [read, write, bash]
---

# Nombre de la Skill

## Cuándo Usar
- Situación 1
- Situación 2

## Estructura / Formato
[Mostrar estructura esperada]

## Ejemplos
[Ejemplos de código o uso]

## Reglas
1. Regla 1
2. Regla 2
```

## Campos del Frontmatter

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| name | Sí | Identificador único (kebab-case) |
| description | Sí | Descripción con triggers para auto-invocación |
| scope | No | Dónde aplica: root, ui, api, sdk |
| tools | No | Herramientas permitidas: read, write, bash |

## Buenas Prácticas

1. **Máximo 500 líneas** - Si es más largo, dividir en archivos
2. **Descripción con triggers** - Palabras clave que activan la skill
3. **Ejemplos concretos** - Más ejemplos = mejores resultados
4. **Reglas claras** - Lista de do's y don'ts

## Ejemplo: Crear skill para API REST

```markdown
---
name: rest-api
description: Diseñar APIs REST. Usa cuando crees endpoints, definas rutas, o trabajes con HTTP.
scope: api
tools: [read, write]
---

# API REST

## Convenciones de Rutas
- GET /resources - Listar
- GET /resources/:id - Obtener uno
- POST /resources - Crear
- PUT /resources/:id - Actualizar completo
- PATCH /resources/:id - Actualizar parcial
- DELETE /resources/:id - Eliminar

## Códigos de Estado
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

## Reglas
1. Nombres en plural (users, no user)
2. Usar sustantivos, no verbos
3. Versionar: /api/v1/resources
```

## Después de Crear

1. Agregar skill a `skills/` del proyecto
2. Ejecutar `agent-auto sync` para sincronizar a IDEs
3. Verificar que el trigger funciona preguntando al agente
