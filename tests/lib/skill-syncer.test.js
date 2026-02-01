import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { syncSkills } from '../../lib/skill-syncer.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMP_DIR = join(__dirname, '..', '.temp');

describe('skill-syncer', () => {
  beforeEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true });
    mkdirSync(TEMP_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  });

  describe('syncSkills', () => {
    it('should create AGENTS.md if it does not exist', async () => {
      const projectPath = join(TEMP_DIR, 'new-project');
      mkdirSync(join(projectPath, 'skills', 'my-skill'), { recursive: true });
      writeFileSync(join(projectPath, 'skills', 'my-skill', 'SKILL.md'), `---
name: my-skill
description: A test skill
scope: root
---

# My Skill
`);

      await syncSkills(projectPath);

      expect(existsSync(join(projectPath, 'AGENTS.md'))).toBe(true);
    });

    it('should insert skill reference block into AGENTS.md', async () => {
      const projectPath = join(TEMP_DIR, 'existing-project');
      mkdirSync(join(projectPath, 'skills', 'my-skill'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n\nSome description.\n');
      writeFileSync(join(projectPath, 'skills', 'my-skill', 'SKILL.md'), `---
name: my-skill
description: A test skill
scope: root
allowed_tools: [read, write]
metadata:
  auto_invoke:
    - "my trigger"
---

# My Skill
`);

      await syncSkills(projectPath);

      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      expect(content).toContain('<!-- SKILL-SYNC:START -->');
      expect(content).toContain('<!-- SKILL-SYNC:END -->');
      expect(content).toContain('[my-skill]');
      expect(content).toContain('A test skill');
      expect(content).toContain('(tools: read, write)');
      expect(content).toContain('my trigger');
    });

    it('should be idempotent (running twice gives same result)', async () => {
      const projectPath = join(TEMP_DIR, 'idempotent-project');
      mkdirSync(join(projectPath, 'skills', 'my-skill'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n\nSome description.\n');
      writeFileSync(join(projectPath, 'skills', 'my-skill', 'SKILL.md'), `---
name: my-skill
description: A test skill
scope: root
---

# My Skill
`);

      await syncSkills(projectPath);
      const firstRun = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');

      await syncSkills(projectPath);
      const secondRun = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');

      expect(firstRun).toBe(secondRun);
    });

    it('should update existing block when skills change', async () => {
      const projectPath = join(TEMP_DIR, 'update-project');
      mkdirSync(join(projectPath, 'skills', 'skill-a'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), `# Project

<!-- SKILL-SYNC:START -->
## Skills Reference
- [old-skill](skills/old-skill/SKILL.md) - Old skill
<!-- SKILL-SYNC:END -->
`);
      writeFileSync(join(projectPath, 'skills', 'skill-a', 'SKILL.md'), `---
name: skill-a
description: New skill A
scope: root
---

# Skill A
`);

      await syncSkills(projectPath);

      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      expect(content).toContain('[skill-a]');
      expect(content).toContain('New skill A');
      expect(content).not.toContain('[old-skill]');
    });

    it('should handle multiple skills sorted alphabetically', async () => {
      const projectPath = join(TEMP_DIR, 'multi-skills');
      mkdirSync(join(projectPath, 'skills', 'zebra'), { recursive: true });
      mkdirSync(join(projectPath, 'skills', 'alpha'), { recursive: true });
      mkdirSync(join(projectPath, 'skills', 'beta'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');

      const skillTemplate = (name) => `---
name: ${name}
description: ${name} skill
scope: root
---

# ${name}
`;
      writeFileSync(join(projectPath, 'skills', 'zebra', 'SKILL.md'), skillTemplate('zebra'));
      writeFileSync(join(projectPath, 'skills', 'alpha', 'SKILL.md'), skillTemplate('alpha'));
      writeFileSync(join(projectPath, 'skills', 'beta', 'SKILL.md'), skillTemplate('beta'));

      await syncSkills(projectPath);

      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      const alphaIndex = content.indexOf('[alpha]');
      const betaIndex = content.indexOf('[beta]');
      const zebraIndex = content.indexOf('[zebra]');

      expect(alphaIndex).toBeLessThan(betaIndex);
      expect(betaIndex).toBeLessThan(zebraIndex);
    });

    it('should handle skills without auto_invoke', async () => {
      const projectPath = join(TEMP_DIR, 'no-autoinvoke');
      mkdirSync(join(projectPath, 'skills', 'simple'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');
      writeFileSync(join(projectPath, 'skills', 'simple', 'SKILL.md'), `---
name: simple
description: Simple skill without triggers
scope: root
---

# Simple
`);

      await syncSkills(projectPath);

      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      expect(content).toContain('[simple]');
      expect(content).toContain('(Sin skills auto-invocadas)');
    });

    it('should generate auto-invoke table sorted alphabetically', async () => {
      const projectPath = join(TEMP_DIR, 'autoinvoke-sorted');
      mkdirSync(join(projectPath, 'skills', 'my-skill'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');
      writeFileSync(join(projectPath, 'skills', 'my-skill', 'SKILL.md'), `---
name: my-skill
description: Skill with triggers
scope: root
metadata:
  auto_invoke:
    - "zebra action"
    - "alpha action"
    - "beta action"
---

# My Skill
`);

      await syncSkills(projectPath);

      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      const alphaIndex = content.indexOf('alpha action');
      const betaIndex = content.indexOf('beta action');
      const zebraIndex = content.indexOf('zebra action');

      expect(alphaIndex).toBeLessThan(betaIndex);
      expect(betaIndex).toBeLessThan(zebraIndex);
    });
  });

  describe('scope filtering', () => {
    it('should include root scope skills for all components', async () => {
      const projectPath = join(TEMP_DIR, 'scope-test');
      mkdirSync(join(projectPath, 'skills', 'root-skill'), { recursive: true });
      mkdirSync(join(projectPath, 'apps', 'web'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');
      writeFileSync(join(projectPath, 'apps', 'web', 'package.json'), '{}');
      writeFileSync(join(projectPath, 'skills', 'root-skill', 'SKILL.md'), `---
name: root-skill
description: Available everywhere
scope: root
---

# Root Skill
`);

      await syncSkills(projectPath);

      const rootContent = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      const webContent = readFileSync(join(projectPath, 'apps', 'web', 'AGENTS.md'), 'utf8');

      expect(rootContent).toContain('[root-skill]');
      expect(webContent).toContain('[root-skill]');
    });

    it('should filter skills by component scope', async () => {
      const projectPath = join(TEMP_DIR, 'scope-filter');
      mkdirSync(join(projectPath, 'skills', 'web-skill'), { recursive: true });
      mkdirSync(join(projectPath, 'skills', 'api-skill'), { recursive: true });
      mkdirSync(join(projectPath, 'apps', 'web'), { recursive: true });
      mkdirSync(join(projectPath, 'apps', 'api'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');
      writeFileSync(join(projectPath, 'apps', 'web', 'package.json'), '{}');
      writeFileSync(join(projectPath, 'apps', 'api', 'package.json'), '{}');

      writeFileSync(join(projectPath, 'skills', 'web-skill', 'SKILL.md'), `---
name: web-skill
description: Only for web
scope: web
---

# Web Skill
`);
      writeFileSync(join(projectPath, 'skills', 'api-skill', 'SKILL.md'), `---
name: api-skill
description: Only for api
scope: api
---

# API Skill
`);

      await syncSkills(projectPath);

      const webContent = readFileSync(join(projectPath, 'apps', 'web', 'AGENTS.md'), 'utf8');
      const apiContent = readFileSync(join(projectPath, 'apps', 'api', 'AGENTS.md'), 'utf8');

      expect(webContent).toContain('[web-skill]');
      expect(webContent).not.toContain('[api-skill]');
      expect(apiContent).toContain('[api-skill]');
      expect(apiContent).not.toContain('[web-skill]');
    });
  });

  describe('monorepo support', () => {
    it('should detect apps/ components', async () => {
      const projectPath = join(TEMP_DIR, 'monorepo-apps');
      mkdirSync(join(projectPath, 'skills', 'shared'), { recursive: true });
      mkdirSync(join(projectPath, 'apps', 'frontend'), { recursive: true });
      mkdirSync(join(projectPath, 'apps', 'backend'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Monorepo\n');
      writeFileSync(join(projectPath, 'apps', 'frontend', 'package.json'), '{}');
      writeFileSync(join(projectPath, 'apps', 'backend', 'package.json'), '{}');
      writeFileSync(join(projectPath, 'skills', 'shared', 'SKILL.md'), `---
name: shared
description: Shared skill
scope: global
---

# Shared
`);

      await syncSkills(projectPath);

      expect(existsSync(join(projectPath, 'apps', 'frontend', 'AGENTS.md'))).toBe(true);
      expect(existsSync(join(projectPath, 'apps', 'backend', 'AGENTS.md'))).toBe(true);
    });

    it('should detect packages/ components', async () => {
      const projectPath = join(TEMP_DIR, 'monorepo-packages');
      mkdirSync(join(projectPath, 'skills', 'shared'), { recursive: true });
      mkdirSync(join(projectPath, 'packages', 'ui'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Monorepo\n');
      writeFileSync(join(projectPath, 'packages', 'ui', 'package.json'), '{}');
      writeFileSync(join(projectPath, 'skills', 'shared', 'SKILL.md'), `---
name: shared
description: Shared skill
scope: root
---

# Shared
`);

      await syncSkills(projectPath);

      expect(existsSync(join(projectPath, 'packages', 'ui', 'AGENTS.md'))).toBe(true);
    });

    it('should detect services/ components', async () => {
      const projectPath = join(TEMP_DIR, 'monorepo-services');
      mkdirSync(join(projectPath, 'skills', 'shared'), { recursive: true });
      mkdirSync(join(projectPath, 'services', 'auth'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Monorepo\n');
      writeFileSync(join(projectPath, 'services', 'auth', 'package.json'), '{}');
      writeFileSync(join(projectPath, 'skills', 'shared', 'SKILL.md'), `---
name: shared
description: Shared skill
scope: root
---

# Shared
`);

      await syncSkills(projectPath);

      expect(existsSync(join(projectPath, 'services', 'auth', 'AGENTS.md'))).toBe(true);
    });
  });

  describe('check mode', () => {
    it('should report out of sync when AGENTS.md needs update', async () => {
      const projectPath = join(TEMP_DIR, 'check-out-of-sync');
      mkdirSync(join(projectPath, 'skills', 'my-skill'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n\nOld content.\n');
      writeFileSync(join(projectPath, 'skills', 'my-skill', 'SKILL.md'), `---
name: my-skill
description: A test skill
scope: root
---

# My Skill
`);

      const result = await syncSkills(projectPath, { check: true });

      expect(result.outOfSync.length).toBeGreaterThan(0);
      // Should not modify the file
      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      expect(content).not.toContain('[my-skill]');
    });

    it('should report synced when AGENTS.md is up to date', async () => {
      const projectPath = join(TEMP_DIR, 'check-synced');
      mkdirSync(join(projectPath, 'skills', 'my-skill'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');
      writeFileSync(join(projectPath, 'skills', 'my-skill', 'SKILL.md'), `---
name: my-skill
description: A test skill
scope: root
---

# My Skill
`);

      // First sync to get it up to date
      await syncSkills(projectPath);

      // Now check should pass
      const result = await syncSkills(projectPath, { check: true });

      expect(result.outOfSync.length).toBe(0);
      expect(result.skipped.length).toBeGreaterThan(0);
    });
  });

  describe('dry run mode', () => {
    it('should not write files in dry run mode', async () => {
      const projectPath = join(TEMP_DIR, 'dry-run');
      mkdirSync(join(projectPath, 'skills', 'my-skill'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');
      writeFileSync(join(projectPath, 'skills', 'my-skill', 'SKILL.md'), `---
name: my-skill
description: A test skill
scope: root
---

# My Skill
`);

      const result = await syncSkills(projectPath, { dryRun: true });

      expect(result.synced.length).toBeGreaterThan(0);
      // Should not modify the file
      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      expect(content).not.toContain('[my-skill]');
    });
  });

  describe('edge cases', () => {
    it('should handle project without skills directory', async () => {
      const projectPath = join(TEMP_DIR, 'no-skills');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');

      // Should not throw and return results object
      const result = await syncSkills(projectPath);
      expect(result).toHaveProperty('synced');
      expect(result).toHaveProperty('errors');
    });

    it('should skip SKILL.md without name field', async () => {
      const projectPath = join(TEMP_DIR, 'invalid-skill');
      mkdirSync(join(projectPath, 'skills', 'invalid'), { recursive: true });
      mkdirSync(join(projectPath, 'skills', 'valid'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');

      // Invalid: no name
      writeFileSync(join(projectPath, 'skills', 'invalid', 'SKILL.md'), `---
description: Invalid skill without name
---

# Invalid
`);
      // Valid
      writeFileSync(join(projectPath, 'skills', 'valid', 'SKILL.md'), `---
name: valid
description: Valid skill
scope: root
---

# Valid
`);

      await syncSkills(projectPath);

      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      expect(content).toContain('[valid]');
      expect(content).not.toContain('[invalid]');
    });

    it('should handle SKILL.md without frontmatter', async () => {
      const projectPath = join(TEMP_DIR, 'no-frontmatter');
      mkdirSync(join(projectPath, 'skills', 'broken'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');
      writeFileSync(join(projectPath, 'skills', 'broken', 'SKILL.md'), '# No Frontmatter\n\nJust content.');

      // Should not throw and return results object
      const result = await syncSkills(projectPath);
      expect(result).toHaveProperty('synced');
    });

    it('should handle empty skills directory', async () => {
      const projectPath = join(TEMP_DIR, 'empty-skills');
      mkdirSync(join(projectPath, 'skills'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');

      // Should not throw and return results object
      const result = await syncSkills(projectPath);
      expect(result).toHaveProperty('synced');
    });

    it('should normalize allowed_tools from various formats', async () => {
      const projectPath = join(TEMP_DIR, 'tools-formats');
      mkdirSync(join(projectPath, 'skills', 'with-tools'), { recursive: true });
      writeFileSync(join(projectPath, 'AGENTS.md'), '# Project\n');

      // Using 'tools' instead of 'allowed_tools'
      writeFileSync(join(projectPath, 'skills', 'with-tools', 'SKILL.md'), `---
name: with-tools
description: Skill with tools alias
scope: root
tools: [read, write, exec]
---

# With Tools
`);

      await syncSkills(projectPath);

      const content = readFileSync(join(projectPath, 'AGENTS.md'), 'utf8');
      expect(content).toContain('(tools: read, write, exec)');
    });
  });
});
