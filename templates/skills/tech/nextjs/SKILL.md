---
name: nextjs
description: Desarrollo con Next.js 14+. Usa cuando trabajes con App Router, Server Components, o rutas API.
scope: ui
tools: [read, write, bash]
---

# Next.js (App Router)

## Estructura

```
app/
├── layout.tsx          # Layout raíz
├── page.tsx            # Página principal (/)
├── loading.tsx         # UI de carga
├── error.tsx           # UI de error
├── not-found.tsx       # 404
├── (auth)/             # Grupo de rutas (no afecta URL)
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/
│   ├── layout.tsx      # Layout anidado
│   └── page.tsx
└── api/
    └── users/route.ts  # API Route
```

## Server vs Client Components

```tsx
// Por defecto = Server Component
// NO usar useState, useEffect, onClick, etc.
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}

// Client Component - agregar 'use client'
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Data Fetching

```tsx
// Server Component - fetch directo
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store',  // SSR dinámico
    // cache: 'force-cache', // SSG estático
    // next: { revalidate: 60 }, // ISR cada 60s
  });
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <main>{/* usar data */}</main>;
}
```

## Server Actions

```tsx
// En archivo separado o inline
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  await db.users.create({ name });
  revalidatePath('/users');
}

// Uso en componente
export default function Form() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">Crear</button>
    </form>
  );
}
```

## API Routes (Route Handlers)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.users.create(body);
  return NextResponse.json(user, { status: 201 });
}

// Con parámetros dinámicos: app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.users.findUnique({ where: { id: params.id } });
  return NextResponse.json(user);
}
```

## Metadata

```tsx
// Estática
export const metadata = {
  title: 'Mi App',
  description: 'Descripción de mi app',
};

// Dinámica
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return { title: product.name };
}
```

## Reglas

1. Server Components por defecto, `'use client'` solo cuando necesario
2. Fetch data en Server Components, no en Client
3. Server Actions para mutaciones (forms, updates)
4. Usar `loading.tsx` y `error.tsx` para UX
5. Metadata en cada página para SEO
