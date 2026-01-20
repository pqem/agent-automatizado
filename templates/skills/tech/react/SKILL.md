---
name: react
description: Desarrollo con React. Usa cuando crees componentes, hooks, o trabajes con estado/efectos.
scope: ui
tools: [read, write]
---

# React

## Estructura de Componentes

```
components/
├── ui/              # Componentes base (Button, Input, Card)
├── features/        # Componentes de funcionalidad específica
└── layouts/         # Layouts y wrappers
```

## Componente Funcional Base

```tsx
interface Props {
  title: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function MiComponente({ title, onClick, children }: Props) {
  return (
    <div onClick={onClick}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

## Hooks Comunes

### useState
```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

### useEffect
```tsx
// Ejecutar al montar
useEffect(() => {
  fetchData();
}, []);

// Ejecutar cuando cambie dependency
useEffect(() => {
  updateSomething(dependency);
}, [dependency]);

// Cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### Custom Hooks
```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

## Patrones

### Composición sobre herencia
```tsx
// ✅ Bien - composición
<Card>
  <CardHeader title="Título" />
  <CardBody>{content}</CardBody>
</Card>

// ❌ Evitar - props excesivas
<Card title="Título" body={content} footer={footer} />
```

### Render Props / Children as Function
```tsx
<DataFetcher url="/api/users">
  {({ data, loading }) => 
    loading ? <Spinner /> : <UserList users={data} />
  }
</DataFetcher>
```

## Reglas

1. Un componente = un archivo
2. Props tipadas con interface/type
3. Evitar `any`, usar tipos específicos
4. Custom hooks empiezan con `use`
5. Componentes en PascalCase
6. Hooks solo en el nivel superior (no en condicionales)
