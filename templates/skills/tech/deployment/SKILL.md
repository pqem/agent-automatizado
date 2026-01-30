---
name: deployment
description: CI/CD pipelines, Docker, Kubernetes, cloud deployment, and release strategies
scope: root
metadata:
  auto_invoke:
    - "deployment"
    - "CI/CD"
    - "Docker"
    - "Kubernetes"
    - "deploy"
    - "pipeline"
    - "release"
allowed_tools: [read, write, exec]
---

# Deployment & CI/CD

## CI/CD Pipeline

### Stages típicas

```
Code → Build → Test → Deploy → Monitor
```

**1. Build:**
- Compilar código
- Generar artefactos (bundle, binary)
- Crear Docker image

**2. Test:**
- Unit tests
- Integration tests
- Linters
- Security scans

**3. Deploy:**
- Staging → tests E2E → Production
- Blue/green o canary
- Rollback automático si falla

**4. Monitor:**
- Health checks
- Metrics
- Alerts

## GitHub Actions

### Workflow básico

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install deps
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          echo "${{ secrets.SSH_KEY }}" > key.pem
          chmod 600 key.pem
          ssh -i key.pem user@server 'cd /app && git pull && npm install && pm2 restart app'
```

### Secrets

```bash
# GitHub repo → Settings → Secrets
# Agregar:
# - SSH_KEY
# - DATABASE_URL
# - API_KEYS

# Usar en workflow
${{ secrets.SSH_KEY }}
```

## Docker

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Best practices:**
- Multi-stage para reducir tamaño
- Alpine images (más pequeñas)
- Layer caching (COPY package.json antes de COPY .)
- .dockerignore (node_modules, .git)
- Non-root user

### Docker Compose (local)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://db:5432/myapp
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
# Run
docker-compose up

# Rebuild
docker-compose up --build

# Logs
docker-compose logs -f app
```

## Kubernetes

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service (load balancer)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

### Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
type: Opaque
data:
  database-url: cG9zdGdyZXM6Ly8uLi4= # base64
```

```bash
# Crear secret
kubectl create secret generic myapp-secrets \
  --from-literal=database-url=postgres://...

# Aplicar manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Ver estado
kubectl get pods
kubectl logs <pod-name>
kubectl describe pod <pod-name>

# Scale
kubectl scale deployment myapp --replicas=5

# Rollout
kubectl rollout status deployment/myapp
kubectl rollout undo deployment/myapp
```

## Cloud Platforms

### Vercel (Next.js, static)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

**Configuración:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

### Railway / Render (backend)

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
```

Auto-deploy desde GitHub.

### AWS (EC2, ECS, Lambda)

**EC2 + PM2:**
```bash
# SSH a instancia
ssh -i key.pem ubuntu@ec2-ip

# Install app
git clone repo
cd app
npm install
npm run build

# PM2 (process manager)
npm install -g pm2
pm2 start dist/index.js --name myapp
pm2 save
pm2 startup
```

**ECS (Docker):**
```json
{
  "family": "myapp",
  "containerDefinitions": [{
    "name": "myapp",
    "image": "myapp:latest",
    "memory": 512,
    "cpu": 256,
    "essential": true,
    "portMappings": [{
      "containerPort": 3000,
      "protocol": "tcp"
    }]
  }]
}
```

**Lambda (serverless):**
```javascript
export const handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello' })
  };
};
```

## Release Strategies

### Blue/Green

```
Blue (v1) ← 100% traffic
Green (v2) ← 0% traffic

Deploy v2 to Green
Test Green
Switch traffic: Blue ← 0%, Green ← 100%
Keep Blue for rollback
```

**Pros:** Rollback instantáneo
**Contras:** Requiere 2x recursos

### Canary

```
v1 ← 90% traffic
v2 ← 10% traffic (canary)

Monitor errors/latency
If OK: v1 ← 50%, v2 ← 50%
If OK: v1 ← 0%, v2 ← 100%
```

**Pros:** Riesgo reducido
**Contras:** Más complejo

### Rolling

```
3 instances con v1
Replace 1 → v2
Replace 2 → v2
Replace 3 → v2
```

**Pros:** No downtime, menos recursos
**Contras:** Versiones mezcladas temporalmente

## Environment Variables

```bash
# .env (local)
NODE_ENV=development
DATABASE_URL=postgresql://localhost/dev
API_KEY=dev-key

# .env.production (server)
NODE_ENV=production
DATABASE_URL=postgresql://prod-db/app
API_KEY=prod-key-secret

# Kubernetes Secret
kubectl create secret generic app-env \
  --from-env-file=.env.production

# Docker
docker run -e DATABASE_URL=... myapp
docker run --env-file .env.production myapp
```

## Health Checks

```javascript
// Express
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Con DB check
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});
```

## Rollback

```bash
# Git
git revert <commit>
git push

# Docker
docker tag myapp:v1.2.3 myapp:latest
docker push myapp:latest

# Kubernetes
kubectl rollout undo deployment/myapp
kubectl rollout undo deployment/myapp --to-revision=2

# Vercel
vercel rollback
```

## Monitoring Post-Deploy

```javascript
// Sentry (errores)
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: '...' });

// Prometheus (métricas)
import promClient from 'prom-client';
const register = new promClient.Registry();

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

// Healthcheck continuo (UptimeRobot, etc)
```

## Checklist Pre-Deploy

- [ ] Tests pasan (unit, integration)
- [ ] Linter sin errores
- [ ] Security audit (npm audit)
- [ ] Environment variables configuradas
- [ ] Database migrations ejecutadas
- [ ] Backup de DB
- [ ] Rollback plan listo
- [ ] Monitoring configurado
- [ ] Health checks funcionando
- [ ] Smokemidtest en staging

## Troubleshooting

**Deploy falla:**
```bash
# Logs
kubectl logs <pod-name>
docker logs <container-id>
pm2 logs

# Shell en container
kubectl exec -it <pod-name> -- /bin/sh
docker exec -it <container-id> sh

# Verificar env vars
env | grep DATABASE
```

**App crashea:**
```bash
# Restart
pm2 restart myapp
kubectl rollout restart deployment/myapp

# Ver logs recientes
pm2 logs --lines 100
kubectl logs <pod-name> --tail=100
```

---

**Filosofía:** Automatizar todo. Deploy manual = errores inevitables. CI/CD confiable > velocidad sin tests.
