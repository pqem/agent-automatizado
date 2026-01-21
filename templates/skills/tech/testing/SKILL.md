---
name: testing
description: Escribir tests. Usa cuando crees tests unitarios, de integración, o necesites patrones de testing.
scope: root
metadata.auto_invoke: ["tests", "testing", "test runner"]
allowed_tools: [read, write, bash]
---

# Testing

## Estructura de Tests

```
tests/
├── unit/           # Tests unitarios
│   └── utils.test.ts
├── integration/    # Tests de integración
│   └── api.test.ts
└── e2e/            # Tests end-to-end
    └── auth.spec.ts
```

## Jest / Vitest Básico

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// o import { describe, it, expect, jest } from '@jest/globals';

describe('Calculator', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
});
```

## Matchers Comunes

```ts
// Igualdad
expect(value).toBe(5);              // ===
expect(obj).toEqual({ a: 1 });      // deep equal
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Números
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(10);
expect(0.1 + 0.2).toBeCloseTo(0.3);

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// Arrays
expect(arr).toContain(item);
expect(arr).toHaveLength(3);

// Excepciones
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
```

## Mocking

```ts
// Mock de función
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'test' });

// Mock de módulo
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
}));

// Spy
const spy = vi.spyOn(object, 'method');
expect(spy).toHaveBeenCalledWith('arg');
expect(spy).toHaveBeenCalledTimes(2);
```

## Setup/Teardown

```ts
beforeAll(() => {
  // Antes de todos los tests
});

beforeEach(() => {
  // Antes de cada test
});

afterEach(() => {
  // Después de cada test
  vi.clearAllMocks();
});

afterAll(() => {
  // Después de todos los tests
});
```

## Testing React Components

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Async

```ts
it('fetches data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ id: 1 });
});

it('handles async errors', async () => {
  await expect(fetchBadData()).rejects.toThrow('Not found');
});
```

## Patrones

### AAA (Arrange, Act, Assert)
```ts
it('should update user', () => {
  // Arrange
  const user = { name: 'Test' };
  
  // Act
  const result = updateUser(user, { name: 'Updated' });
  
  // Assert
  expect(result.name).toBe('Updated');
});
```

## Reglas

1. Un test = un comportamiento específico
2. Tests independientes entre sí
3. Nombres descriptivos: "should X when Y"
4. Evitar lógica en tests (if, loops)
5. Mockear dependencias externas (API, DB)
6. Coverage no es todo: priorizar casos críticos
