import { ESLint, Linter } from 'eslint';
import { sync } from 'globby';
import jsonDiff from 'json-diff';
import { readFileSync } from 'node:fs';

/**
 * Simplified report of ESLint issues
 */
export type SimplifiedReport = Pick<ESLint.LintResult, 'filePath' | 'messages'>[];

const enum JsonDiffType {
  NOTHING = ' ',
  DELETED = '-',
  ADDED = '+',
  MODIFIED = '~'
}

/**
 * Merge several ESLint reports into one report
 * @param pattern
 */
export const mergeESLintReports = (pattern: Parameters<typeof sync>[0]) => sync(pattern).flatMap((filePath) => JSON.parse(readFileSync(filePath).toString()));

/**
 * Retrieve the list of introduced ESLint issues between two reports
 * @param reportBase
 * @param reportBranch
 */
export const getIntroducedESLintIssues = (reportBase: ESLint.LintResult[], reportBranch: ESLint.LintResult[]) => {
  const reportDiff: [JsonDiffType, ESLint.LintResult][] = jsonDiff.diff(reportBase, reportBranch, { full: true });
  const filesWithChanges = reportDiff.filter(([diffType]) => diffType === JsonDiffType.ADDED || diffType === JsonDiffType.MODIFIED);
  return filesWithChanges.reduce((acc: SimplifiedReport, [diffType, fileReport]) => {
    const messages = diffType === JsonDiffType.ADDED && fileReport.messages.length
      ? fileReport.messages
      : (fileReport.messages as any as [JsonDiffType, Linter.LintMessage[]])
        .filter(([diffType]) => diffType === JsonDiffType.ADDED || diffType === JsonDiffType.MODIFIED)
        .map(([, fileMessages]) => fileMessages as Linter.LintMessage)

    if (messages.length) {
      return acc.concat({
        filePath: fileReport.filePath,
        messages
      });
    }
    return acc;
  }, []);
}

