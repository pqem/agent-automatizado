import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { syncIDERules, getSupportedIDEs, checkIDESync } from '../../lib/ide-syncer.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMP_DIR = join(__dirname, '..', '.temp');

describe('ide-syncer', () => {
  beforeEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true });
    mkdirSync(TEMP_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  });

  describe('getSupportedIDEs', () => {
    it('should return list of supported IDEs', () => {
      const ides = getSupportedIDEs();

      expect(ides).toBeInstanceOf(Array);
      expect(ides.length).toBeGreaterThan(0);
      expect(ides.some(ide => ide.name === 'cursor')).toBe(true);
      expect(ides.some(ide => ide.name === 'claude')).toBe(true);
      expect(ides.some(ide => ide.name === 'copilot')).toBe(true);
    });

    it('should include file path for each IDE', () => {
      const ides = getSupportedIDEs();

      for (const ide of ides) {
        expect(ide).toHaveProperty('name');
        expect(ide).toHaveProperty('file');
        expect(typeof ide.file).toBe('string');
      }
    });
  });

  describe('syncIDERules', () => {
    it('should create PROJECT.md if it does not exist', async () => {
      const projectPath = join(TEMP_DIR, 'new-project');
      mkdirSync(projectPath, { recursive: true });

      const result = await syncIDERules(projectPath);

      expect(result.projectCreated).toBe(true);
      expect(existsSync(join(projectPath, 'PROJECT.md'))).toBe(true);
    });

    it('should not sync IDEs when PROJECT.md was just created', async () => {
      const projectPath = join(TEMP_DIR, 'new-project');
      mkdirSync(projectPath, { recursive: true });

      const result = await syncIDERules(projectPath);

      expect(result.projectCreated).toBe(true);
      expect(result.synced.length).toBe(0);
    });

    it('should sync all IDEs when PROJECT.md exists', async () => {
      const projectPath = join(TEMP_DIR, 'existing-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project\n\n## Stack\n- Node.js');

      const result = await syncIDERules(projectPath);

      expect(result.projectCreated).toBe(false);
      expect(result.synced.length).toBeGreaterThan(0);
    });

    it('should create .cursorrules file', async () => {
      const projectPath = join(TEMP_DIR, 'cursor-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      await syncIDERules(projectPath, { only: ['cursor'] });

      expect(existsSync(join(projectPath, '.cursorrules'))).toBe(true);
      const content = readFileSync(join(projectPath, '.cursorrules'), 'utf8');
      expect(content).toContain('# Reglas para Cursor AI');
      expect(content).toContain('# My Project');
    });

    it('should create CLAUDE.md file', async () => {
      const projectPath = join(TEMP_DIR, 'claude-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      await syncIDERules(projectPath, { only: ['claude'] });

      expect(existsSync(join(projectPath, 'CLAUDE.md'))).toBe(true);
      const content = readFileSync(join(projectPath, 'CLAUDE.md'), 'utf8');
      expect(content).toContain('# Instrucciones para Claude');
    });

    it('should create .github/copilot-instructions.md with nested directory', async () => {
      const projectPath = join(TEMP_DIR, 'copilot-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      await syncIDERules(projectPath, { only: ['copilot'] });

      expect(existsSync(join(projectPath, '.github', 'copilot-instructions.md'))).toBe(true);
    });

    it('should create .zed/instructions.md with nested directory', async () => {
      const projectPath = join(TEMP_DIR, 'zed-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      await syncIDERules(projectPath, { only: ['zed'] });

      expect(existsSync(join(projectPath, '.zed', 'instructions.md'))).toBe(true);
    });

    it('should create .warp/rules.md with nested directory', async () => {
      const projectPath = join(TEMP_DIR, 'warp-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      await syncIDERules(projectPath, { only: ['warp'] });

      expect(existsSync(join(projectPath, '.warp', 'rules.md'))).toBe(true);
    });

    it('should only sync specified IDEs with --only option', async () => {
      const projectPath = join(TEMP_DIR, 'only-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      await syncIDERules(projectPath, { only: ['cursor', 'claude'] });

      expect(existsSync(join(projectPath, '.cursorrules'))).toBe(true);
      expect(existsSync(join(projectPath, 'CLAUDE.md'))).toBe(true);
      expect(existsSync(join(projectPath, '.github', 'copilot-instructions.md'))).toBe(false);
    });

    it('should skip already synced files', async () => {
      const projectPath = join(TEMP_DIR, 'synced-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      // First sync
      await syncIDERules(projectPath, { only: ['cursor'] });

      // Second sync should skip
      const result = await syncIDERules(projectPath, { only: ['cursor'] });

      expect(result.skipped.length).toBe(1);
      expect(result.skipped[0].ide).toBe('cursor');
      expect(result.skipped[0].reason).toBe('up-to-date');
    });

    it('should update files when PROJECT.md changes', async () => {
      const projectPath = join(TEMP_DIR, 'update-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# Original Project');

      // First sync
      await syncIDERules(projectPath, { only: ['cursor'] });
      const originalContent = readFileSync(join(projectPath, '.cursorrules'), 'utf8');

      // Update PROJECT.md
      writeFileSync(join(projectPath, 'PROJECT.md'), '# Updated Project');

      // Second sync should update
      const result = await syncIDERules(projectPath, { only: ['cursor'] });

      expect(result.synced.length).toBe(1);
      const updatedContent = readFileSync(join(projectPath, '.cursorrules'), 'utf8');
      expect(updatedContent).not.toBe(originalContent);
      expect(updatedContent).toContain('# Updated Project');
    });
  });

  describe('dry run mode', () => {
    it('should not write files in dry run mode', async () => {
      const projectPath = join(TEMP_DIR, 'dryrun-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      const result = await syncIDERules(projectPath, { dryRun: true });

      expect(result.synced.length).toBeGreaterThan(0);
      expect(result.synced[0].dryRun).toBe(true);
      expect(existsSync(join(projectPath, '.cursorrules'))).toBe(false);
    });
  });

  describe('check mode', () => {
    it('should report out of sync files', async () => {
      const projectPath = join(TEMP_DIR, 'check-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      const result = await syncIDERules(projectPath, { check: true });

      expect(result.outOfSync.length).toBeGreaterThan(0);
      expect(existsSync(join(projectPath, '.cursorrules'))).toBe(false);
    });

    it('should report no issues when files are synced', async () => {
      const projectPath = join(TEMP_DIR, 'synced-check');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      // First sync
      await syncIDERules(projectPath, { only: ['cursor'] });

      // Check should find nothing out of sync
      const result = await checkIDESync(projectPath);

      // cursor is synced, others are out of sync
      expect(result.outOfSync.some(item => item.ide === 'cursor')).toBe(false);
    });
  });

  describe('checkIDESync', () => {
    it('should be equivalent to syncIDERules with check: true', async () => {
      const projectPath = join(TEMP_DIR, 'check-sync-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      const checkResult = await checkIDESync(projectPath);
      const syncResult = await syncIDERules(projectPath, { check: true });

      expect(checkResult.outOfSync.length).toBe(syncResult.outOfSync.length);
    });
  });

  describe('error handling', () => {
    it('should handle invalid IDE names in only option', async () => {
      const projectPath = join(TEMP_DIR, 'invalid-ide');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project');

      const result = await syncIDERules(projectPath, { only: ['invalid-ide', 'cursor'] });

      // Should only process valid IDE (cursor)
      expect(result.synced.some(item => item.ide === 'cursor')).toBe(true);
      expect(result.synced.some(item => item.ide === 'invalid-ide')).toBe(false);
    });
  });

  describe('content generation', () => {
    it('should include header, project content, and footer', async () => {
      const projectPath = join(TEMP_DIR, 'content-project');
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, 'PROJECT.md'), '# My Project\n\n## Stack\n- Node.js');

      await syncIDERules(projectPath, { only: ['cursor'] });

      const content = readFileSync(join(projectPath, '.cursorrules'), 'utf8');

      // Header
      expect(content).toContain('# Reglas para Cursor AI');

      // Project content
      expect(content).toContain('# My Project');
      expect(content).toContain('## Stack');
      expect(content).toContain('- Node.js');

      // Footer
      expect(content).toContain('Código limpio y conciso');
    });

    it('should preserve PROJECT.md content exactly', async () => {
      const projectPath = join(TEMP_DIR, 'exact-content');
      mkdirSync(projectPath, { recursive: true });
      const projectContent = `# Test Project

## Special Characters
- \`code blocks\`
- **bold** and *italic*
- [links](url)

## Code
\`\`\`javascript
const x = 1;
\`\`\`
`;
      writeFileSync(join(projectPath, 'PROJECT.md'), projectContent);

      await syncIDERules(projectPath, { only: ['claude'] });

      const content = readFileSync(join(projectPath, 'CLAUDE.md'), 'utf8');
      expect(content).toContain('## Special Characters');
      expect(content).toContain('`code blocks`');
      expect(content).toContain('```javascript');
    });
  });
});
