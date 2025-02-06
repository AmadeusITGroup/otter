import * as core from '@actions/core';
import { getExecOutput } from '@actions/exec';
import type { Severity } from 'audit-types';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  computeNpmReport, computeYarn1Report,
  computeYarn3Report,
  computeYarn4Report,
  OtterAdvisory,
  OtterAuditReport, OtterAuditReporter,
  severities
} from './reports';

const colors = ['', 'green', 'yellow', 'orange', 'red'];

async function run(): Promise<void> {

  try {
    const cwd = process.env.GITHUB_WORKSPACE!;
    const packageManager = fs.existsSync(path.resolve(cwd, 'yarn.lock')) ? 'yarn' : 'npm';
    const severityConfig = core.getInput('severity') as Severity;
    const allWorkspaces = core.getInput('allWorkspaces') === 'true';
    const recursive = core.getInput('recursive') === 'true';
    const environment = core.getInput('environment');
    let auditReporter: OtterAuditReporter;
    let auditCommand: string;
    if (packageManager === 'yarn') {
      const versionOutput = await getExecOutput('yarn --version', [], {cwd: process.env.GITHUB_WORKSPACE});
      const version = Number.parseInt(versionOutput.stdout.split('.')[0], 10);
      auditCommand = version <= 1 ?
        `yarn audit ${environment === 'production' ? '--groups "dependencies peerDependencies" ' : ''}--json` :
        `yarn npm audit --environment ${environment} ${allWorkspaces ? '--all ' : ''}${recursive ? '--recursive ' : ''}--json`;
      auditReporter = version >= 4 ? computeYarn4Report : version >= 2 ? computeYarn3Report : computeYarn1Report;
    } else {
      auditCommand = `npm audit ${allWorkspaces ? '--workspaces --include-root-workspace ' : ''}--json`;
      auditReporter = computeNpmReport;
    }

    const {stdout: report, stderr: err} = await getExecOutput(auditCommand, [], {
      cwd,
      ignoreReturnCode: true,
      env: {
        ...process.env,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        NODE_ENV: environment
      }
    });
    core.warning(err);
    core.setOutput('reportJSON', report);
    const reportData: OtterAuditReport = auditReporter(report, severityConfig);

    if (!reportData.highestSeverityFound) {
      core.info('No vulnerability detected.');
      return;
    } else {
      core.info(`Highest severity found: ${reportData.highestSeverityFound}`);
    }
    const isFailed = reportData.errors.length > 0;

    const getBadge = (sev: Severity) => `![${sev}](https://img.shields.io/static/v1?label=&logo=npm&message=${sev}&color=${colors[severities.indexOf(sev)]})`;

    const formatVulnerability = (vulnerability: OtterAdvisory) => `
### ${vulnerability.moduleName} ${getBadge(vulnerability.severity)}

<details>
  <summary>Details</summary>

${vulnerability.overview.replaceAll('### ', '#### ')}
</details>

`;

    const isVulnerabilityWithKnownSeverity = (advisory: OtterAdvisory) => severities.indexOf(advisory.severity) >= 0;

    const sortVulnerabilityBySeverity = (advisory1: OtterAdvisory, advisory2: OtterAdvisory) => severities.indexOf(advisory2.severity) - severities.indexOf(advisory1.severity);

    const body = `# Audit report ${isFailed ? ':x:' : ':white_check_mark:'}

${reportData.nbVulnerabilities} vulnerabilities found.

${reportData.errors.length ? `## Vulnerabilities to be fixed

${reportData.errors
    .filter(isVulnerabilityWithKnownSeverity)
    .sort(sortVulnerabilityBySeverity)
    .map(formatVulnerability)
    .join(os.EOL)
}
` : ''}
${reportData.warnings.length ? `___

<details>
<summary>
Vulnerabilities below the threshold: ${severityConfig}
</summary>

${reportData.warnings
    .filter(isVulnerabilityWithKnownSeverity)
    .sort(sortVulnerabilityBySeverity)
    .map(formatVulnerability)
    .join(os.EOL)
    .replaceAll('${', '&#36;{')
}

</details>
` : ''}
`;
    core.setOutput('reportMarkdown', body);
    if (isFailed) {
      core.error(`Found at least one vulnerability equal to or higher than the configured severity threshold: ${severityConfig}.`);
      throw new Error(`Yarn audit found dependencies with vulnerabilities above the severity threshold: ${severityConfig}. Please look at the Audit report.`);
    } else {
      core.info(`Vulnerabilities were detected but all below the configured severity threshold: ${severityConfig}.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

void run();
