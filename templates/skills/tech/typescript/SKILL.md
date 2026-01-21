---
name: typescript
description: Desarrollo con TypeScript. Usa cuando definas tipos, interfaces, o necesites tipado estricto.
scope: root
metadata.auto_invoke: ["TypeScript", "tipos", "interfaces"]
allowed_tools: [read, write]
---

# TypeScript

## Tipos vs Interfaces

```ts
// Interface - para objetos, extensible
interface User {
  id: string;
  name: string;
  email: string;
}

// Type - para unions, intersections, tipos complejos
type Status = 'pending' | 'active' | 'inactive';
type UserWithStatus = User & { status: Status };
```

## Genéricos

```ts
// Función genérica
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Interface genérica
interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}

// Restricciones
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Utility Types

```ts
// Parcial - todas las props opcionales
type PartialUser = Partial<User>;

// Required - todas obligatorias
type RequiredUser = Required<User>;

// Pick - seleccionar props
type UserName = Pick<User, 'name' | 'email'>;

// Omit - excluir props
type UserWithoutId = Omit<User, 'id'>;

// Record - objeto con claves tipadas
type UserRoles = Record<string, 'admin' | 'user'>;
```

## Type Guards

```ts
// typeof
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value * 2;
}

// in
function hasName(obj: unknown): obj is { name: string } {
  return typeof obj === 'object' && obj !== null && 'name' in obj;
}

// instanceof
if (error instanceof Error) {
  console.log(error.message);
}
```

## Patrones Comunes

```ts
// Discriminated Unions
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Const assertions
const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

// Satisfies (TS 4.9+)
const palette = {
  red: '#ff0000',
  green: '#00ff00',
} satisfies Record<string, string>;
```

## Reglas

1. Evitar `any` - usar `unknown` si es necesario
2. Tipar explícitamente retornos de funciones públicas
3. Usar `strict: true` en tsconfig
4. Preferir `interface` para objetos, `type` para unions
5. No usar `@ts-ignore` sin comentario explicativo
