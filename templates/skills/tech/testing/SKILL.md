---
name: testing
description: Testing strategies - unit, integration, E2E, TDD, and best practices
scope: root
metadata:
  auto_invoke:
    - "tests"
    - "testing"
    - "unit test"
    - "integration test"
    - "E2E"
    - "TDD"
    - "test coverage"
    - "pytest"
    - "jest"
    - "vitest"
allowed_tools: [read, write, exec]
---

# Testing Strategies

## Pirámide de testing

```
      /\
     /E2E\      ← Pocos, lentos, frágiles
    /------\
   /Integr.\   ← Moderados, validan flujos
  /----------\
 /   Unit     \ ← Muchos, rápidos, enfocados
/--------------\
```

**Regla 70/20/10:**
- 70% Unit tests
- 20% Integration tests
- 10% E2E tests

## Unit Tests

**Qué testear:**
- Funciones puras (mismo input → mismo output)
- Lógica de negocio
- Edge cases
- Manejo de errores

**Qué NO testear:**
- Getters/setters triviales
- Frameworks (ya están testeados)
- Código autogenerado

### Estructura AAA

```javascript
// Arrange - Setup
const user = { name: 'Pablo', age: 30 };

// Act - Ejecutar
const result = calculateDiscount(user);

// Assert - Verificar
expect(result).toBe(0.1);
```

### Ejemplos por framework

**Jest / Vitest (JavaScript/TypeScript):**
```javascript
import { describe, it, expect } from 'vitest';
import { sum } from './math';

describe('sum', () => {
  it('suma dos números positivos', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('maneja números negativos', () => {
    expect(sum(-1, -1)).toBe(-2);
  });

  it('maneja cero', () => {
    expect(sum(0, 5)).toBe(5);
  });
});
```

**Pytest (Python):**
```python
import pytest
from math_utils import sum_numbers

def test_sum_positive_numbers():
    assert sum_numbers(2, 3) == 5

def test_sum_negative_numbers():
    assert sum_numbers(-1, -1) == -2

def test_sum_with_zero():
    assert sum_numbers(0, 5) == 5

@pytest.mark.parametrize("a,b,expected", [
    (1, 1, 2),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_sum_parametrized(a, b, expected):
    assert sum_numbers(a, b) == expected
```

### Mocking

**Cuándo mockear:**
- APIs externas
- Bases de datos
- File system
- Tiempo (Date.now(), etc.)
- Dependencias lentas

**Jest:**
```javascript
import { fetchUser } from './api';
import axios from 'axios';

jest.mock('axios');

it('obtiene usuario de API', async () => {
  axios.get.mockResolvedValue({ 
    data: { id: 1, name: 'Pablo' } 
  });

  const user = await fetchUser(1);
  
  expect(user.name).toBe('Pablo');
  expect(axios.get).toHaveBeenCalledWith('/users/1');
});
```

**Pytest:**
```python
from unittest.mock import Mock, patch
from user_service import get_user

@patch('user_service.requests.get')
def test_get_user(mock_get):
    mock_get.return_value.json.return_value = {
        'id': 1, 'name': 'Pablo'
    }
    
    user = get_user(1)
    
    assert user['name'] == 'Pablo'
    mock_get.assert_called_once_with('/users/1')
```

## Integration Tests

**Qué testear:**
- Flujos entre múltiples componentes
- Queries de DB reales (test DB)
- APIs internas
- Autenticación/autorización

### Database tests

**Setup/Teardown:**
```javascript
// Jest
beforeEach(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

afterEach(async () => {
  await db.migrate.rollback();
});

it('crea usuario en DB', async () => {
  const user = await User.create({ 
    name: 'Pablo', 
    email: 'pablo@example.com' 
  });
  
  const found = await User.findById(user.id);
  expect(found.name).toBe('Pablo');
});
```

**Pytest con fixtures:**
```python
import pytest
from app.db import db, User

@pytest.fixture
def db_session():
    db.create_all()
    yield db.session
    db.session.rollback()
    db.drop_all()

def test_create_user(db_session):
    user = User(name='Pablo', email='pablo@example.com')
    db_session.add(user)
    db_session.commit()
    
    found = User.query.filter_by(email='pablo@example.com').first()
    assert found.name == 'Pablo'
```

### API tests

```javascript
// Supertest (Express)
import request from 'supertest';
import app from './app';

it('POST /users crea usuario', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Pablo', email: 'pablo@example.com' })
    .expect(201);
  
  expect(res.body.id).toBeDefined();
  expect(res.body.name).toBe('Pablo');
});

it('GET /users/:id requiere auth', async () => {
  await request(app)
    .get('/users/1')
    .expect(401);
});
```

## E2E Tests

**Qué testear:**
- Happy path completo (signup → login → uso → logout)
- Flujos críticos de negocio
- Casos que toquen múltiples sistemas

### Playwright (recomendado)

```javascript
import { test, expect } from '@playwright/test';

test('usuario puede registrarse y hacer login', async ({ page }) => {
  // Signup
  await page.goto('/signup');
  await page.fill('[name="email"]', 'pablo@example.com');
  await page.fill('[name="password"]', 'secret123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Bienvenido');
  
  // Logout
  await page.click('[data-testid="logout-button"]');
  await expect(page).toHaveURL('/');
});

test('validación de formulario', async ({ page }) => {
  await page.goto('/signup');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.error')).toContainText('Email requerido');
});
```

### Cypress

```javascript
describe('User flow', () => {
  it('usuario puede crear proyecto', () => {
    cy.visit('/login');
    cy.get('[name="email"]').type('pablo@example.com');
    cy.get('[name="password"]').type('secret123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Nuevo Proyecto').click();
    
    cy.get('[name="title"]').type('Mi Proyecto');
    cy.get('[name="description"]').type('Descripción test');
    cy.get('button').contains('Crear').click();
    
    cy.contains('Mi Proyecto').should('be.visible');
  });
});
```

## TDD (Test-Driven Development)

### Ciclo Red-Green-Refactor

1. **Red:** Escribir test que falla
2. **Green:** Escribir código mínimo para pasar test
3. **Refactor:** Mejorar código manteniendo tests verdes

### Ejemplo

```javascript
// 1. RED - Test falla (función no existe)
it('calcula factorial', () => {
  expect(factorial(5)).toBe(120);
});

// 2. GREEN - Implementación mínima
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// 3. REFACTOR - Optimizar
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
```

## Coverage

**Qué medir:**
- **Line coverage:** % líneas ejecutadas
- **Branch coverage:** % ramas (if/else) cubiertas
- **Function coverage:** % funciones llamadas

**Target recomendado:**
- 80% coverage general
- 100% para lógica crítica (pagos, auth, etc.)

**Comandos:**
```bash
# Jest
npm test -- --coverage

# Pytest
pytest --cov=src --cov-report=html

# Vitest
vitest --coverage
```

**Revisar reporte:**
- HTML: `coverage/index.html`
- Identificar código sin testear
- Agregar tests para casos críticos

## Best Practices

### ✅ Hacer

**Tests independientes:**
```javascript
// ✅ Bueno - cada test es independiente
it('test A', () => {
  const data = createTestData();
  expect(processData(data)).toBe(expected);
});

it('test B', () => {
  const data = createTestData();
  expect(processData(data)).toBe(expected);
});
```

**Nombres descriptivos:**
```javascript
// ✅ Bueno
it('rechaza login con password incorrecta', () => {});

// ❌ Malo
it('test login', () => {});
```

**Un assert por concepto:**
```javascript
// ✅ Bueno
it('usuario tiene email válido', () => {
  expect(user.email).toContain('@');
});

it('usuario tiene nombre completo', () => {
  expect(user.name).toBeTruthy();
});

// ❌ Malo - múltiples conceptos
it('usuario válido', () => {
  expect(user.email).toContain('@');
  expect(user.name).toBeTruthy();
  expect(user.age).toBeGreaterThan(0);
});
```

### ❌ Evitar

**Tests frágiles:**
```javascript
// ❌ Malo - depende de orden de array
expect(users[0].name).toBe('Pablo');

// ✅ Bueno
expect(users.find(u => u.id === 1).name).toBe('Pablo');
```

**Tests lentos innecesarios:**
```javascript
// ❌ Malo - sleep arbitrario
await sleep(1000);
expect(data).toBeDefined();

// ✅ Bueno - waitFor con condición
await waitFor(() => expect(data).toBeDefined());
```

**Magic numbers:**
```javascript
// ❌ Malo
expect(calculatePrice(item)).toBe(123.45);

// ✅ Bueno
const EXPECTED_PRICE = 100 * 1.15 + 8.45; // base + tax + shipping
expect(calculatePrice(item)).toBe(EXPECTED_PRICE);
```

## Testing por stack

### React

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

it('incrementa contador', () => {
  render(<Counter />);
  
  const button = screen.getByRole('button', { name: /incrementar/i });
  const count = screen.getByText(/count: 0/i);
  
  fireEvent.click(button);
  
  expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});
```

### Django

```python
from django.test import TestCase, Client
from myapp.models import User

class UserTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='pablo',
            password='secret123'
        )
    
    def test_login(self):
        response = self.client.post('/login/', {
            'username': 'pablo',
            'password': 'secret123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.wsgi_request.user.is_authenticated)
```

### FastAPI

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_user():
    response = client.post("/users/", json={
        "name": "Pablo",
        "email": "pablo@example.com"
    })
    assert response.status_code == 201
    assert response.json()["name"] == "Pablo"
```

## CI/CD Integration

**GitHub Actions:**
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

**Pre-commit hook:**
```bash
# .git/hooks/pre-commit
#!/bin/bash
npm test
if [ $? -ne 0 ]; then
  echo "Tests fallaron. Commit cancelado."
  exit 1
fi
```

---

**Filosofía:** Un test confiable que falla es mejor que 10 tests que siempre pasan sin verificar nada real.
