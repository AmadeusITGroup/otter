import {
  mkdir,
  writeFile,
} from 'node:fs/promises';
import {
  dirname,
  join,
} from 'node:path';
import type {
  MatcherReturnType,
} from '@playwright/test';
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
 * The report of the visual testing report
 */
export type VisualTestingReporterReport = ScreenshotInformation[];

type ScreenshotMatcherReturnType = MatcherReturnType & ScreenshotInformation & {
  name: 'toHaveScreenshot';
};

/**
 * Configuration for the visual testing reporter
 */
export interface VisualTestingReporterOptions {
  /** The output file for the report */
  outputFile?: string;
}

export class VisualTestingReporter implements Reporter {
  private suite!: Suite;
  private readonly outputFile: string;

  constructor(options: VisualTestingReporterOptions) {
    this.outputFile = options.outputFile || join(process.cwd(), 'playwright-reports/visual-testing/report.json');
  }

  public printsToStdio() {
    return false;
  }

  public onBegin(_: FullConfig, suite: Suite) {
    this.suite = suite;
  }

  public async onEnd() {
    const screenshotsToUpdate: VisualTestingReporterReport = this.suite.allTests().flatMap((test) =>
      test.results.flatMap((result) =>
        result.errors
          .map((error) => (error as any).matcherResult)
          .filter((matcherResult: MatcherReturnType | undefined): matcherResult is ScreenshotMatcherReturnType =>
            matcherResult?.name === 'toHaveScreenshot'
            && typeof matcherResult.actual === 'string'
            && typeof matcherResult.expected === 'string'
            && !matcherResult.pass
          )
          .map(({ actual, expected }) => ({ actual, expected }) as ScreenshotInformation)
      )
    );
    await mkdir(dirname(this.outputFile), { recursive: true });
    return writeFile(this.outputFile, JSON.stringify(screenshotsToUpdate, null, 2));
  }
}

export default VisualTestingReporter;
