import { describe, it, expect, beforeEach } from 'vitest';
import { detectProject } from '../../lib/detector.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync, rmSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES_DIR = join(__dirname, '..', 'fixtures', 'projects');
const TEMP_DIR = join(__dirname, '..', '.temp');

describe('detectProject', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true });
  });

  describe('Node.js projects', () => {
    it('should detect Next.js project', async () => {
      const result = await detectProject(join(FIXTURES_DIR, 'nextjs-app'));

      expect(result.type).toBe('nextjs');
      expect(result.language).toBe('typescript');
      expect(result.frameworks).toContain('nextjs');
      expect(result.frameworks).toContain('react');
      expect(result.frameworks).toContain('tailwind');
    });

    it('should detect Express API project', async () => {
      const result = await detectProject(join(FIXTURES_DIR, 'express-api'));

      expect(result.type).toBe('api');
      expect(result.language).toBe('javascript');
      expect(result.frameworks).toContain('express');
      // Note: hasTests is based on directory existence, not package.json deps
    });

    it('should detect React web project', async () => {
      const tempProject = join(TEMP_DIR, 'react-app');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), JSON.stringify({
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' }
      }));

      const result = await detectProject(tempProject);

      expect(result.type).toBe('web');
      expect(result.frameworks).toContain('react');
    });

    it('should detect Vue web project', async () => {
      const tempProject = join(TEMP_DIR, 'vue-app');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), JSON.stringify({
        dependencies: { vue: '^3.0.0' }
      }));

      const result = await detectProject(tempProject);

      expect(result.type).toBe('web');
      expect(result.frameworks).toContain('vue');
    });

    it('should detect TypeScript from tsconfig.json', async () => {
      const tempProject = join(TEMP_DIR, 'ts-project');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), JSON.stringify({}));
      writeFileSync(join(tempProject, 'tsconfig.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.language).toBe('typescript');
    });

    it('should detect Fastify API project', async () => {
      const tempProject = join(TEMP_DIR, 'fastify-api');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), JSON.stringify({
        dependencies: { fastify: '^4.0.0' }
      }));

      const result = await detectProject(tempProject);

      expect(result.type).toBe('api');
      expect(result.frameworks).toContain('fastify');
    });

    it('should detect NestJS API project', async () => {
      const tempProject = join(TEMP_DIR, 'nest-api');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), JSON.stringify({
        dependencies: { '@nestjs/core': '^10.0.0' }
      }));

      const result = await detectProject(tempProject);

      expect(result.type).toBe('api');
      expect(result.frameworks).toContain('nestjs');
    });
  });

  describe('Python projects', () => {
    it('should detect Python project with requirements.txt', async () => {
      const result = await detectProject(join(FIXTURES_DIR, 'python-project'));

      expect(result.type).toBe('web');
      expect(result.language).toBe('python');
      expect(result.frameworks).toContain('flask');
      // Note: hasTests detection from requirements.txt is overwritten by directory check
    });

    it('should detect FastAPI project', async () => {
      const tempProject = join(TEMP_DIR, 'fastapi-project');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'requirements.txt'), 'fastapi\nuvicorn\n');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('api');
      expect(result.frameworks).toContain('fastapi');
    });

    it('should detect Django project', async () => {
      const tempProject = join(TEMP_DIR, 'django-project');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'requirements.txt'), 'django\ndjango-rest-framework\n');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('web');
      expect(result.frameworks).toContain('django');
    });
  });

  describe('AI Agent projects', () => {
    it('should detect AI agent project', async () => {
      const tempProject = join(TEMP_DIR, 'ai-agent');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'SOUL.md'), '# Soul');
      writeFileSync(join(tempProject, 'IDENTITY.md'), '# Identity');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('ai-agent');
      expect(result.language).toBe('agent-config');
      expect(result.hasDocs).toBe(true);
    });

    it('should detect AI agent with Claude integration', async () => {
      const tempProject = join(TEMP_DIR, 'ai-agent-claude');
      mkdirSync(join(tempProject, '.claude'), { recursive: true });
      writeFileSync(join(tempProject, 'SOUL.md'), '# Soul');
      writeFileSync(join(tempProject, 'IDENTITY.md'), '# Identity');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('ai-agent');
      expect(result.frameworks).toContain('claude');
    });

    it('should detect AI agent with skills', async () => {
      const tempProject = join(TEMP_DIR, 'ai-agent-skills');
      mkdirSync(join(tempProject, 'skills'), { recursive: true });
      writeFileSync(join(tempProject, 'SOUL.md'), '# Soul');
      writeFileSync(join(tempProject, 'IDENTITY.md'), '# Identity');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('ai-agent');
      expect(result.frameworks).toContain('agent-skills');
    });
  });

  describe('Other languages', () => {
    it('should detect Go project', async () => {
      const tempProject = join(TEMP_DIR, 'go-project');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'go.mod'), 'module example.com/myapp');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('go');
      expect(result.language).toBe('go');
    });

    it('should detect Rust project', async () => {
      const tempProject = join(TEMP_DIR, 'rust-project');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'Cargo.toml'), '[package]\nname = "myapp"');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('rust');
      expect(result.language).toBe('rust');
    });

    it('should detect Java Maven project', async () => {
      const tempProject = join(TEMP_DIR, 'java-maven');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'pom.xml'), '<project></project>');

      const result = await detectProject(tempProject);

      expect(result.type).toBe('java-maven');
      expect(result.language).toBe('java');
    });
  });

  describe('Project structure', () => {
    it('should detect monorepo with packages/', async () => {
      const tempProject = join(TEMP_DIR, 'monorepo-packages');
      mkdirSync(join(tempProject, 'packages'), { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.structure).toBe('monorepo');
    });

    it('should detect monorepo with apps/', async () => {
      const tempProject = join(TEMP_DIR, 'monorepo-apps');
      mkdirSync(join(tempProject, 'apps'), { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.structure).toBe('monorepo');
    });

    it('should detect monorepo with lerna.json', async () => {
      const tempProject = join(TEMP_DIR, 'monorepo-lerna');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');
      writeFileSync(join(tempProject, 'lerna.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.structure).toBe('monorepo');
    });

    it('should detect single project structure', async () => {
      const tempProject = join(TEMP_DIR, 'single-project');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.structure).toBe('single');
    });
  });

  describe('Project features', () => {
    it('should detect tests directory', async () => {
      const tempProject = join(TEMP_DIR, 'with-tests');
      mkdirSync(join(tempProject, 'tests'), { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.hasTests).toBe(true);
    });

    it('should detect __tests__ directory', async () => {
      const tempProject = join(TEMP_DIR, 'with-jest-tests');
      mkdirSync(join(tempProject, '__tests__'), { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.hasTests).toBe(true);
    });

    it('should detect CI/CD with GitHub Actions', async () => {
      const tempProject = join(TEMP_DIR, 'with-ci');
      mkdirSync(join(tempProject, '.github', 'workflows'), { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.hasCI).toBe(true);
    });

    it('should detect docs directory', async () => {
      const tempProject = join(TEMP_DIR, 'with-docs');
      mkdirSync(join(tempProject, 'docs'), { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');

      const result = await detectProject(tempProject);

      expect(result.hasDocs).toBe(true);
    });

    it('should detect README.md as docs', async () => {
      const tempProject = join(TEMP_DIR, 'with-readme');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), '{}');
      writeFileSync(join(tempProject, 'README.md'), '# Project');

      const result = await detectProject(tempProject);

      expect(result.hasDocs).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle unknown project type', async () => {
      const tempProject = join(TEMP_DIR, 'unknown');
      mkdirSync(tempProject, { recursive: true });

      const result = await detectProject(tempProject);

      expect(result.type).toBe('unknown');
      expect(result.language).toBe('unknown');
    });

    it('should handle malformed package.json', async () => {
      const tempProject = join(TEMP_DIR, 'bad-json');
      mkdirSync(tempProject, { recursive: true });
      writeFileSync(join(tempProject, 'package.json'), 'not valid json');

      const result = await detectProject(tempProject);

      expect(result.language).toBe('javascript');
      expect(result.type).toBe('node');
    });
  });
});
