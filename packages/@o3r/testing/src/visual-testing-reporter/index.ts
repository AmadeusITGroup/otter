import {
  mkdir,
  writeFile,
} from 'node:fs/promises';
import {
  dirname,
  join,
} from 'node:path';
import {
  type FullConfig,
  type Reporter,
  type Suite,
} from '@playwright/test/reporter';

/**
 * The screenshot information
 */
export interface ScreenshotInformation {
  /**
   * The path of the actual screenshot
   */
  actual: string;
  /**
   * The path of the expected screenshot
   */
  expected: string;
}

/**
 * The report of the visual testing campaign
 */
export type VisualTestingReporterReport = ScreenshotInformation[];

/**
 * Configuration for the visual testing reporter
 */
export interface VisualTestingReporterOptions {
  /** The output file for the report */
  outputFile?: string;
}

/**
 * Playwright reporter for visual testing
 */
export class VisualTestingPlaywrightReporter implements Reporter {
  private suite!: Suite;
  private readonly outputFile: string;

  constructor(options: VisualTestingReporterOptions) {
    this.outputFile = options.outputFile || join(process.cwd(), 'playwright-reports/visual-testing/report.json');
  }

  /**
   * @inheritdoc
   */
  public printsToStdio() {
    return false;
  }

  /**
   * @inheritdoc
   */
  public onBegin(_: FullConfig, suite: Suite) {
    this.suite = suite;
  }

  /**
   * @inheritdoc
   */
  public async onEnd() {
    const fileNameExtractor = /snapshot:\s*(?<dir>(?:[\w-]+[\\/]+)*)(?<filename>[\w-]+)\.(?<extension>\w+)/i;
    const screenshotsToUpdate: VisualTestingReporterReport = this.suite.allTests().flatMap((test) =>
      test.results.flatMap((result) =>
        result.errors
          .reduce((acc, error: any) => {
            if (error.matcherResult?.name === 'toHaveScreenshot'
              && typeof error.matcherResult.actual === 'string'
              && typeof error.matcherResult.expected === 'string'
              && !error.matcherResult.pass) {
              // Playwright <= 1.51
              acc.push({ actual: error.matcherResult.actual, expected: error.matcherResult.expected });
            } else if (fileNameExtractor.test(error.message)) {
              // Playwright > 1.51
              const { dir, filename, extension } = fileNameExtractor.exec(error.message)!.groups as RegExpExecArray['groups'] & {
                dir: string; filename: string; extension: string;
              };
              if (filename && extension) {
                const attachmentMatcherActual = new RegExp(`${dir}${filename}-actual.${extension}`);
                const attachmentMatcherExpected = new RegExp(`${dir}${filename}-expected.${extension}`);
                const actual = result.attachments.find((attachment) => attachmentMatcherActual.test(attachment.name));
                const expected = result.attachments.find((attachment) => attachmentMatcherExpected.test(attachment.name));
                if (actual?.path && expected?.path) {
                  acc.push({ actual: actual.path, expected: expected.path });
                }
              }
            }
            return acc;
          }, [] as ScreenshotInformation[])
      )
    );
    await mkdir(dirname(this.outputFile), { recursive: true });
    return writeFile(this.outputFile, JSON.stringify(screenshotsToUpdate, null, 2));
  }
}

export default VisualTestingPlaywrightReporter;
