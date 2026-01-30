# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Estructura del Proyecto
{{STRUCTURE}}

## Stack Tecnológico
{{STACK}}

## Arquitectura Next.js

### App Router (Next.js 13+)
```
app/
├── (marketing)/      # Route group (no afecta URL)
│   ├── page.tsx      # /
│   └── about/
│       └── page.tsx  # /about
├── dashboard/
│   ├── layout.tsx    # Layout compartido
│   ├── page.tsx      # /dashboard
│   └── settings/
│       └── page.tsx  # /dashboard/settings
└── api/
    └── users/
        └── route.ts  # API route
```

### Convenciones de componentes

**Server Components (default):**
- Fetch data directamente
- Renderizado en servidor
- No pueden usar hooks (useState, useEffect)
- Mejor performance inicial

**Client Components:**
- `'use client'` al inicio
- Interactividad (clicks, estado)
- Hooks de React
- Browser APIs

### Data Fetching

**Server Components:**
```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 } // ISR cada 60s
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

**Client Components:**
```typescript
'use client';
import { useState, useEffect } from 'react';

export default function ClientPosts() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts);
  }, []);
  
  return <PostList posts={posts} />;
}
```

### Server Actions

```typescript
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  // DB operation
  await db.post.create({ title });
  revalidatePath('/posts');
}

// app/new/page.tsx
import { createPost } from '../actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button>Create</button>
    </form>
  );
}
```

## Styling

### Tailwind CSS
```tsx
<div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-md">
  <h2 className="text-2xl font-bold">Title</h2>
</div>
```

### CSS Modules (alternativa)
```tsx
import styles from './Button.module.css';

<button className={styles.primary}>Click</button>
```

## Performance

### Image Optimization
```tsx
import Image from 'next/image';

<Image 
  src="/photo.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // Above fold
/>
```

### Metadata (SEO)
```typescript
// app/page.tsx
export const metadata = {
  title: 'Page Title',
  description: 'Page description for SEO',
};
```

### Loading States
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}
```

## Environment Variables

```bash
# .env.local (local dev)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://...

# Variables con NEXT_PUBLIC_ son accesibles en browser
# Sin prefijo son solo server-side
```

## Convenciones

### Commits
- `feat(ui)`: nuevo componente
- `fix(api)`: corrección de endpoint
- `perf`: optimización de performance

### Archivos
- `PascalCase.tsx` para componentes
- `kebab-case.ts` para utilidades
- `[id].tsx` para dynamic routes
- `(group)` para route groups

## Skills Disponibles

{{SKILLS_LIST}}

## Contexto para el Agente

Nivel del usuario: {{LEVEL}}

{{#if LEVEL_INTERMEDIATE}}
Asumí conocimiento de React básico. Explicá App Router y Server Components cuando sea relevante.
{{/if}}

{{#if LEVEL_ADVANCED}}
Sé conciso. Código directo con Next.js 13+ patterns. Sin explicaciones de React básico.
{{/if}}
