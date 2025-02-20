import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as core from '@actions/core';
import type {
  VisualTestingReporterReport,
} from '@o3r/testing/visual-testing-reporter';

const run = () => {
  try {
    const screenshots = JSON.parse(
      fs.readFileSync(
        core.getInput('reportPath', { required: true }),
        'utf8'
      )
    ) as VisualTestingReporterReport;
    core.setOutput('screenshots', screenshots.length);
    if (screenshots.length === 0) {
      core.info('No screenshots to update.');
      return;
    }
    screenshots.forEach((e) => {
      core.info(`Update screenshot: ${e.expected}`);
      childProcess.spawnSync('mv', [e.actual, e.expected]);
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }
};

run();
