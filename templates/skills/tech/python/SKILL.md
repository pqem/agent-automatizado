---
name: python
description: Desarrollo con Python. Usa cuando escribas código Python, scripts, o APIs.
scope: root
tools: [read, write, bash]
---

# Python

## Estructura de Proyecto

```
src/
├── __init__.py
├── main.py           # Entrada principal
├── models/           # Modelos de datos
│   └── user.py
├── services/         # Lógica de negocio
│   └── user_service.py
├── api/              # Endpoints (si aplica)
│   └── routes.py
└── utils/            # Utilidades
    └── helpers.py
tests/
└── test_*.py
```

## Type Hints

```python
from typing import Optional, List, Dict, Union, Callable

def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}! " * times

def process_items(items: List[str]) -> Dict[str, int]:
    return {item: len(item) for item in items}

def get_user(user_id: int) -> Optional[User]:
    return db.get(user_id)

# Python 3.10+
def handle(value: str | int | None) -> str:
    ...
```

## Dataclasses

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    id: int
    name: str
    email: str
    tags: List[str] = field(default_factory=list)
    
    def full_info(self) -> str:
        return f"{self.name} <{self.email}>"
```

## Pydantic (para APIs)

```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    
    @validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

## Context Managers

```python
# Con clase
class DatabaseConnection:
    def __enter__(self):
        self.conn = connect()
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()

# Con contextlib
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.time()
    yield
    print(f"Elapsed: {time.time() - start}s")
```

## Async

```python
import asyncio

async def fetch_data(url: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def main():
    results = await asyncio.gather(
        fetch_data(url1),
        fetch_data(url2),
    )
```

## Reglas

1. Usar type hints en funciones públicas
2. Docstrings para módulos, clases y funciones públicas
3. snake_case para funciones/variables, PascalCase para clases
4. Una clase por archivo (generalmente)
5. Tests con pytest, nombres `test_*.py`
6. Usar `pathlib.Path` en vez de `os.path`
