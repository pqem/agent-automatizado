# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Estructura del Proyecto
{{STRUCTURE}}

## Stack Tecnológico
{{STACK}}

## Arquitectura API

### Capas
```
routes/endpoints → controllers → services → repositories → database
```

**Principios:**
- Controllers manejan HTTP (request/response)
- Services contienen lógica de negocio
- Repositories acceden a datos
- Separación clara de responsabilidades

### Convenciones de endpoints

**REST:**
- `GET /api/users` - Listar
- `GET /api/users/:id` - Obtener uno
- `POST /api/users` - Crear
- `PUT/PATCH /api/users/:id` - Actualizar
- `DELETE /api/users/:id` - Eliminar

**Status codes:**
- 200 OK - Éxito general
- 201 Created - Recurso creado
- 204 No Content - Éxito sin body
- 400 Bad Request - Validación falló
- 401 Unauthorized - Sin auth
- 403 Forbidden - Auth OK pero sin permisos
- 404 Not Found - Recurso no existe
- 500 Internal Server Error - Error del servidor

## Seguridad

### Authentication
- JWT en header: `Authorization: Bearer <token>`
- Refresh tokens para sesiones largas
- Rate limiting: {{RATE_LIMIT}} requests/min

### Validación
- Validar inputs en controllers
- Sanitizar datos antes de DB
- Usar ORM/query builder (previene SQL injection)

### CORS
```javascript
// Configuración típica
{
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
```

## Testing

### Unit tests
- Services (lógica de negocio)
- Utilidades y helpers

### Integration tests
- Endpoints completos
- Database queries
- Auth flows

### Testing database
- Usar DB de test separada
- Seed con datos conocidos
- Rollback después de cada test

## Convenciones

### Commits
Formato: `tipo(scope): descripción`
- `feat(api)`: nuevo endpoint
- `fix(auth)`: corrección de bug
- `refactor(db)`: cambios sin feat/fix

### Archivos
- `kebab-case` para archivos
- `camelCase` para funciones/variables
- `PascalCase` para clases

## Skills Disponibles

{{SKILLS_LIST}}

## Contexto para el Agente

Nivel del usuario: {{LEVEL}}

{{#if LEVEL_INTERMEDIATE}}
El usuario conoce APIs REST. Asumí conocimiento de HTTP, JSON, y patrones básicos.
{{/if}}

{{#if LEVEL_ADVANCED}}
Sé conciso. Código directo, sin explicaciones básicas de REST o HTTP.
{{/if}}
