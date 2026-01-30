---
name: security
description: Security best practices, OWASP guidelines, auth, secrets management, and common vulnerabilities
scope: root
metadata:
  auto_invoke:
    - "security"
    - "vulnerabilities"
    - "OWASP"
    - "auth"
    - "secrets"
    - "authentication"
    - "authorization"
    - "XSS"
    - "SQL injection"
allowed_tools: [read, write, browser]
---

# Security Best Practices

## OWASP Top 10 (2021)

### 1. Broken Access Control
**Problema:** Usuarios acceden a recursos sin permisos

**Prevención:**
```javascript
// ❌ Malo - confiar en cliente
if (req.query.isAdmin === 'true') {
  // acción privilegiada
}

// ✅ Bueno - verificar en servidor
if (req.user.role === 'admin') {
  // acción privilegiada
}
```

**Principios:**
- Deny by default
- Verificar permisos en cada request
- No exponer IDs internos (usar UUIDs)

### 2. Cryptographic Failures
**Problema:** Datos sensibles sin encriptar

**Prevención:**
```javascript
// Passwords
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hash);

// Datos sensibles
import crypto from 'crypto';
const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
```

**Reglas:**
- HTTPS siempre en producción
- Bcrypt/Argon2 para passwords (nunca MD5/SHA1)
- TLS 1.2+ para comunicaciones
- No almacenar datos sensibles sin necesidad

### 3. Injection (SQL, NoSQL, OS)
**Problema:** Input malicioso ejecutado como código

**SQL Injection:**
```javascript
// ❌ Malo
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Bueno - parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.execute(query, [userId]);

// ✅ Mejor - ORM
const user = await User.findById(userId);
```

**NoSQL Injection:**
```javascript
// ❌ Malo
db.collection.find({ username: req.body.username });

// ✅ Bueno - validar tipo
db.collection.find({ 
  username: String(req.body.username) 
});
```

**Command Injection:**
```javascript
// ❌ Malo
exec(`ping ${req.body.host}`);

// ✅ Bueno - escapar o evitar shell
execFile('ping', ['-c', '4', req.body.host]);
```

### 4. Insecure Design
**Prevención:**
- Threat modeling en diseño
- Defense in depth (múltiples capas)
- Fail securely (errores no revelan info)
- Separation of duties

### 5. Security Misconfiguration
**Checklist:**
- [ ] Remover cuentas/passwords default
- [ ] Deshabilitar directory listing
- [ ] Actualizar frameworks/dependencias
- [ ] Minimal surface (solo lo necesario expuesto)
- [ ] Security headers configurados

### 6. Vulnerable Components
```bash
# Auditar dependencias
npm audit
npm audit fix

# Herramientas
npm install -g snyk
snyk test
```

**Prevención:**
- Dependencias mínimas
- Actualizar regularmente
- Usar lock files (package-lock.json)
- Monitorear CVEs

### 7. Authentication Failures
**Best practices:**

```javascript
// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5 // 5 intentos
});
app.use('/login', limiter);

// Password requirements
const passwordSchema = {
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// MFA (2FA)
import speakeasy from 'speakeasy';
const secret = speakeasy.generateSecret();
const token = speakeasy.totp({
  secret: secret.base32,
  encoding: 'base32'
});
```

**Anti-patterns:**
- ❌ Passwords en URL
- ❌ Session IDs en URL
- ❌ "Forgot password" sin validación
- ❌ No timeout de sesión

### 8. Software Integrity Failures
**Prevención:**
- Verificar integridad de dependencias (SRI)
- Firmar releases
- CI/CD pipeline seguro
- Code review obligatorio

### 9. Security Logging Failures
**Qué loggear:**
```javascript
logger.info('Login attempt', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: Date.now()
});

logger.warn('Failed login', {
  username: req.body.username, // NO loggear password
  ip: req.ip,
  attempts: failedAttempts
});
```

**NO loggear:**
- Passwords
- Tokens
- Credit cards
- PII sensible

### 10. SSRF (Server-Side Request Forgery)
**Prevención:**
```javascript
// Allowlist de dominios
const ALLOWED_HOSTS = ['api.example.com'];

function isAllowed(url) {
  const hostname = new URL(url).hostname;
  return ALLOWED_HOSTS.includes(hostname);
}

if (isAllowed(req.body.url)) {
  await fetch(req.body.url);
}
```

## Authentication Patterns

### JWT
```javascript
import jwt from 'jsonwebtoken';

// Generar
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Verificar
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

**Best practices:**
- Secret fuerte (min 256 bits)
- Expiration corto (1h - 15min)
- Refresh tokens para sesiones largas
- HTTPS only

### OAuth 2.0 / OpenID Connect
```javascript
// Ejemplo con Google
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Redirect a Google
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=${GOOGLE_CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=openid email profile`;

// Callback
const { code } = req.query;
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  body: JSON.stringify({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  })
});
```

## Secrets Management

### Environment Variables
```bash
# .env (nunca commitear)
DATABASE_URL=postgresql://...
API_KEY=abc123...
JWT_SECRET=...

# .gitignore
.env
.env.local
```

### Secrets Managers
```javascript
// AWS Secrets Manager
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ 
  SecretId: 'prod/db/password' 
});

// HashiCorp Vault
import vault from 'node-vault';
const client = vault({ endpoint: 'https://vault.example.com' });
const secret = await client.read('secret/data/db');
```

## Security Headers

```javascript
// Helmet (Express)
import helmet from 'helmet';
app.use(helmet());

// Manual
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Input Validation

```javascript
// Zod (TypeScript)
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  age: z.number().int().positive().max(120)
});

const result = userSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json(result.error);
}

// Joi (JavaScript)
import Joi from 'joi';

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required()
});

const { error } = schema.validate(req.body);
```

## CORS

```javascript
import cors from 'cors';

// Restrictivo (producción)
app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Permisivo (desarrollo)
app.use(cors({
  origin: true,
  credentials: true
}));
```

## Testing de seguridad

### SAST (Static)
```bash
# ESLint security plugin
npm install eslint-plugin-security --save-dev

# Semgrep
semgrep --config=auto src/
```

### DAST (Dynamic)
```bash
# OWASP ZAP
zap-cli quick-scan http://localhost:3000

# Burp Suite (manual)
```

### Dependency scanning
```bash
npm audit
snyk test
```

## Checklist de seguridad

### Pre-deploy
- [ ] Secrets en environment vars / secrets manager
- [ ] HTTPS configurado
- [ ] Security headers (helmet)
- [ ] Input validation en todos los endpoints
- [ ] Rate limiting en auth endpoints
- [ ] SQL queries parametrizadas
- [ ] Dependencies auditadas (npm audit)
- [ ] Passwords hasheados (bcrypt)
- [ ] CORS restrictivo
- [ ] Logs sin datos sensibles

### Post-deploy
- [ ] Penetration testing
- [ ] Monitoring de intentos de acceso
- [ ] Alerts en errores 401/403
- [ ] Backups cifrados
- [ ] Incident response plan

---

**Filosofía:** Security by design > security as afterthought. Pensar como atacante ayuda a defenderse mejor.
