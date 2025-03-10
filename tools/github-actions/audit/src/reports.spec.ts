import {
  readFile,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import {
  computeNpmReport,
  computeYarn1Report,
  computeYarn3Report,
  computeYarn4Report,
} from './reports';

jest.mock('@actions/core');

const MOCK_FOLDER = join(__dirname, '..', 'testing', 'mocks');

describe('github-action audit', () => {
  describe('using NPM', () => {
    it('should compute the npm report in v1', async () => {
      const response = await readFile(join(MOCK_FOLDER, 'npm-v1-audit.json'), 'utf8');
      const report = computeNpmReport(response, 'high');
      expect(report.errors.length).toBe(1);
      expect(report.warnings.length).toBe(1);
      expect(report.highestSeverityFound).toBe('critical');
      expect(report.nbVulnerabilities).toBe(2);
    });

    it('should compute the npm report in v2', async () => {
      const response = await readFile(join(MOCK_FOLDER, 'npm-v2-audit.json'), 'utf8');
      const report = computeNpmReport(response, 'high');
      expect(report.errors.length).toBe(3);
      expect(report.warnings.length).toBe(31);
      expect(report.highestSeverityFound).toBe('critical');
      expect(report.nbVulnerabilities).toBe(34);
    });
  });
  describe('using Yarn', () => {
    it('should compute the yarn report in v1', async () => {
      const response = await readFile(join(MOCK_FOLDER, 'yarn-v1-audit.jsonl'), 'utf8');
      const report = computeYarn1Report(response, 'high');
      expect(report.errors.length).toBe(1);
      expect(report.warnings.length).toBe(4);
      expect(report.highestSeverityFound).toBe('critical');
      expect(report.nbVulnerabilities).toBe(5);
    });

    it('should compute the yarn report in v3', async () => {
      const response = await readFile(join(MOCK_FOLDER, 'yarn-v3-audit.json'), 'utf8');
      const report = computeYarn3Report(response, 'high');
      expect(report.errors.length).toBe(1);
      expect(report.warnings.length).toBe(1);
      expect(report.highestSeverityFound).toBe('critical');
      expect(report.nbVulnerabilities).toBe(2);
    });

    it('should compute the yarn report in v4', async () => {
      const response = await readFile(join(MOCK_FOLDER, 'yarn-v4-audit.jsonl'), 'utf8');
      const report = computeYarn4Report(response, 'high');
      expect(report.errors.length).toBe(1);
      expect(report.warnings.length).toBe(4);
      expect(report.highestSeverityFound).toBe('critical');
      expect(report.nbVulnerabilities).toBe(5);
    });
  });
});
