---
name: performance
description: Performance optimization, profiling, caching, and monitoring strategies
scope: root
metadata:
  auto_invoke:
    - "performance"
    - "optimization"
    - "cache"
    - "profiling"
    - "monitoring"
    - "slow"
    - "latency"
allowed_tools: [read, write, exec, browser]
---

# Performance Optimization

## Metodología

### 1. Measure (medir primero)
**Nunca optimizar sin datos.**

```javascript
// Simple timing
console.time('operation');
await slowOperation();
console.timeEnd('operation');

// Performance API (browser)
const mark = performance.mark('start');
await operation();
performance.measure('operation', 'start');

// Node.js profiling
node --prof app.js
node --prof-process isolate-*.log
```

### 2. Identify bottlenecks
- CPU-bound (cálculos pesados)
- I/O-bound (DB, network, filesystem)
- Memory (leaks, GC pressure)

### 3. Optimize
- Atacar el bottleneck más grande primero
- Cambio → medir → verificar mejora
- Un cambio a la vez

### 4. Verify
- Benchmarks antes/después
- Tests de carga (load testing)
- Monitoring en producción

## Frontend Performance

### Core Web Vitals

**LCP (Largest Contentful Paint) < 2.5s**
```javascript
// Optimizaciones
- Preload critical resources
- Lazy load images
- Server-side rendering (SSR)
- CDN para assets

// Next.js Image
import Image from 'next/image';
<Image 
  src="/hero.jpg" 
  priority 
  width={1200} 
  height={600} 
/>
```

**FID (First Input Delay) < 100ms**
```javascript
// Reducir JS main thread
- Code splitting
- Defer non-critical JS
- Web Workers para cálculos pesados

// React lazy loading
const HeavyComponent = lazy(() => import('./Heavy'));
```

**CLS (Cumulative Layout Shift) < 0.1**
```html
<!-- Reservar espacio para imágenes -->
<img src="photo.jpg" width="400" height="300" alt="Photo">

<!-- Evitar dynamic injection above fold -->
```

### Bundle optimization

```javascript
// Webpack Bundle Analyzer
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

plugins: [
  new BundleAnalyzerPlugin()
]

// Tree shaking (ES modules)
import { specific } from 'lodash-es'; // ✅
import _ from 'lodash'; // ❌ todo el bundle

// Dynamic imports
const module = await import('./heavy-module.js');
```

### Caching strategies

**Service Worker:**
```javascript
// Cache-first (assets estáticos)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Network-first (API, datos frescos)
event.respondWith(
  fetch(event.request)
    .catch(() => caches.match(event.request))
);
```

**HTTP caching:**
```javascript
// Immutable assets
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

// HTML (no cache)
res.setHeader('Cache-Control', 'no-cache, must-revalidate');

// API (cache corto)
res.setHeader('Cache-Control', 'public, max-age=60');
```

## Backend Performance

### Database optimization

**Índices:**
```sql
-- Slow query
SELECT * FROM users WHERE email = 'user@example.com';
-- Tiempo: 500ms (full table scan)

-- Crear índice
CREATE INDEX idx_users_email ON users(email);
-- Tiempo: 5ms

-- Verificar uso de índice
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
```

**N+1 queries:**
```javascript
// ❌ Malo - N+1
const posts = await Post.findAll();
for (const post of posts) {
  post.author = await User.findById(post.authorId); // N queries
}

// ✅ Bueno - eager loading
const posts = await Post.findAll({
  include: [{ model: User, as: 'author' }]
});
```

**Connection pooling:**
```javascript
import { Pool } from 'pg';

const pool = new Pool({
  max: 20, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Reusar conexiones
const client = await pool.connect();
await client.query('SELECT * FROM users');
client.release();
```

### Caching layers

**In-memory (Redis):**
```javascript
import Redis from 'ioredis';
const redis = new Redis();

// Cache-aside pattern
async function getUser(id) {
  // 1. Check cache
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  // 2. Query DB
  const user = await db.user.findById(id);
  
  // 3. Store in cache
  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
  
  return user;
}
```

**CDN (Cloudflare, CloudFront):**
```javascript
// Cache static assets
https://cdn.example.com/assets/bundle.js

// Purge cache
await cloudflare.purgeCache(['https://example.com/api/data']);
```

**Application-level cache:**
```javascript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 });

function expensive() {
  const cached = cache.get('key');
  if (cached) return cached;
  
  const result = heavyComputation();
  cache.set('key', result);
  return result;
}
```

### Async & concurrency

**Paralelizar requests:**
```javascript
// ❌ Secuencial
const users = await fetchUsers(); // 200ms
const posts = await fetchPosts(); // 300ms
// Total: 500ms

// ✅ Paralelo
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
// Total: 300ms
```

**Queue para tareas pesadas:**
```javascript
import Bull from 'bull';

const queue = new Bull('email');

// Encolar
queue.add({ email: 'user@example.com', subject: 'Hi' });

// Procesar en background
queue.process(async (job) => {
  await sendEmail(job.data);
});
```

### Compression

```javascript
import compression from 'compression';

app.use(compression({
  level: 6, // balance speed/compression
  threshold: 1024 // solo > 1KB
}));

// Gzip vs Brotli
// Gzip: más compatible
// Brotli: mejor compresión (20% más)
```

## Profiling

### Node.js

```bash
# CPU profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Heap snapshot
node --inspect app.js
# Chrome DevTools → Memory → Take Heap Snapshot

# Flamegraph
npm install -g 0x
0x app.js
```

### Browser

```javascript
// Chrome DevTools
// 1. Performance tab → Record
// 2. Interact con la app
// 3. Stop → analizar flamegraph

// Lighthouse
lighthouse https://example.com --view

// React Profiler
import { Profiler } from 'react';

<Profiler id="App" onRender={logTimings}>
  <App />
</Profiler>
```

### Database

```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 25;

-- MySQL
EXPLAIN SELECT * FROM users WHERE age > 25;

-- Slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- queries > 1s
```

## Load Testing

**Artillery:**
```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 users/sec

scenarios:
  - flow:
    - get:
        url: '/api/users'
```

```bash
artillery run load-test.yml
```

**k6:**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function() {
  const res = http.get('https://example.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Monitoring

### Metrics a trackear

**Backend:**
- Request rate (requests/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- CPU / Memory usage
- Database query time

**Frontend:**
- LCP, FID, CLS (Core Web Vitals)
- Time to First Byte (TTFB)
- Bundle size
- API call latency

### Tools

```javascript
// Prometheus + Grafana
import promClient from 'prom-client';

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route.path, status: res.statusCode });
  });
  next();
});

// New Relic / Datadog
import newrelic from 'newrelic';
newrelic.recordMetric('Custom/MyMetric', 123);

// Sentry (errores + performance)
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: '...' });
```

## Best Practices

### ✅ Hacer

**Lazy loading:**
```javascript
// Images
<img loading="lazy" src="photo.jpg">

// Routes
const Dashboard = lazy(() => import('./Dashboard'));
```

**Memoization:**
```javascript
// React
const MemoComponent = memo(Component);
const value = useMemo(() => expensive(), [deps]);

// General
import memoize from 'lodash/memoize';
const memoized = memoize(expensiveFunction);
```

**Pagination:**
```javascript
// Limit results
const users = await User.findAll({
  limit: 20,
  offset: page * 20
});

// Cursor-based (better for scale)
const users = await User.findAll({
  where: { id: { [Op.gt]: lastId } },
  limit: 20
});
```

### ❌ Evitar

**Premature optimization:**
> "Premature optimization is the root of all evil" — Donald Knuth

Medir primero, optimizar después.

**Blocking operations:**
```javascript
// ❌ Malo - bloquea event loop
const data = fs.readFileSync('file.txt');

// ✅ Bueno - async
const data = await fs.promises.readFile('file.txt');
```

**Memory leaks:**
```javascript
// ❌ Malo - event listener sin cleanup
element.addEventListener('click', handler);

// ✅ Bueno
element.addEventListener('click', handler);
// Cleanup en unmount
element.removeEventListener('click', handler);
```

## Decision tree

```
¿Performance issue?
├─ Frontend
│  ├─ LCP alto → Image optimization, SSR, CDN
│  ├─ FID alto → Code splitting, Web Workers
│  └─ CLS alto → Reserve space, avoid dynamic injection
└─ Backend
   ├─ DB slow → Índices, N+1 queries, connection pool
   ├─ API slow → Caching (Redis), async, compression
   └─ Memory high → Profiling, leaks, GC tuning
```

---

**Filosofía:** Measure, don't guess. El 80% de la mejora viene del 20% de optimizaciones.
