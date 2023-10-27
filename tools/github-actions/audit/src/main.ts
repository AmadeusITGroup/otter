import * as core from '@actions/core';
import {getExecOutput} from '@actions/exec';
import * as os from 'node:os';
import {GitHubAdvisoryId, NPMAuditReportV1, Severity} from 'audit-types';
import Audit = NPMAuditReportV1.Audit;
import Advisory = NPMAuditReportV1.Advisory;

async function run(): Promise<void> {
  /**
   * Severities supported by yarn npm audit from the lowest to the highest criticality
   */
  const severities: Severity[] = ['info', 'low', 'moderate', 'high', 'critical'];
  const colors = ['', 'green', 'yellow', 'orange', 'red'];

  try {
    const severityConfig = core.getInput('severity') as Severity;
    const allWorkspaces = core.getInput('allWorkspaces') === 'true';
    const recursive = core.getInput('recursive') === 'true';
    const environment = core.getInput('environment');
    const command = `yarn npm audit --environment ${environment} ${allWorkspaces ? '--all ' : ''}${recursive ? '--recursive ' : ''}--json`;

    const {stdout: report} = await getExecOutput(command, [], {cwd: process.env.GITHUB_WORKSPACE});
    core.setOutput('reportJSON', report);

    const reportJson = JSON.parse(report) as Audit;
    core.debug(report);
    const highestSeverityFound: Severity | undefined = severities.reverse().find(severity => reportJson.metadata.vulnerabilities[severity] > 0);

    if (!highestSeverityFound) {
      core.info('No vulnerability detected.');
    } else {
      core.info(`Highest severity found: ${highestSeverityFound}`);
      const isFailed = severities.indexOf(severityConfig) <= severities.indexOf(highestSeverityFound);
      if (isFailed) {
        core.error(`Found at least one vulnerability equal to or higher than the configured severity threshold: ${severityConfig}.`);
        throw new Error(`Yarn audit found dependencies with vulnerabilities above the severity threshold: ${severityConfig}. Please look at the Audit report.`);
      } else {
        core.info(`Vulnerabilities were detected but all below the configured severity threshold: ${severityConfig}.`);
      }
      const vulnerabilities = Object.values(reportJson.advisories as Readonly<Record<GitHubAdvisoryId, Advisory>>)
        .reduce<{ errors: Advisory[]; warnings: Advisory [] }>((currentVulnerabilities, advisory: Advisory) => {
          if (severities.indexOf(severityConfig) <= severities.indexOf(advisory.severity)) {
            currentVulnerabilities.errors.push(advisory);
          } else {
            currentVulnerabilities.warnings.push(advisory);
          }
          return currentVulnerabilities;
        }, {errors: [], warnings: []});

      const nbVulnerabilities = Object.values(reportJson.metadata.vulnerabilities as { [key: string]: number }).reduce((acc, curr) => acc + curr, 0);

      const getBadge = (sev: Severity) => `![${sev}](https://img.shields.io/static/v1?label=&logo=npm&message=${sev}&color=${colors[severities.indexOf(sev)]})`;

      const formatVulnerability = (vulnerability: Advisory) => `
### ${vulnerability.module_name} ${getBadge(vulnerability.severity)}

<details>
  <summary>Details</summary>

${vulnerability.overview.replaceAll('### ', '#### ')}
</details>

`;

      const isVulnerabilityWithKnownSeverity = (advisory: Advisory) => severities.indexOf(advisory.severity) >= 0;

      const sortVulnerabilityBySeverity = (advisory1: Advisory, advisory2: Advisory) => severities.indexOf(advisory2.severity) - severities.indexOf(advisory1.severity);

      const body = `# Audit report ${isFailed ? ':x:' : ':white_check_mark:'}

${nbVulnerabilities} vulnerabilities founds.

${vulnerabilities.errors.length ? `## Vulnerabilities to be fixed

${vulnerabilities.errors
    .filter(isVulnerabilityWithKnownSeverity)
    .sort(sortVulnerabilityBySeverity)
    .map(formatVulnerability)
    .join(os.EOL)
}
` : ''}
${vulnerabilities.warnings.length ? `___

<details>
<summary>
Vunerabilities below the threshold: ${severityConfig}
</summary>

${vulnerabilities.warnings
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
    }
  } catch (error) {
    if (error instanceof Error) {core.setFailed(error.message);}
  }
}

void run();
