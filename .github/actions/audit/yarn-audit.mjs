import { getInput, setOutput, setFailed } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import * as os from 'node:os';

/**
 * Severities supported by yarn npm audit
 */
const severities = ['info', 'low', 'moderate', 'high', 'critical'];
const colors = ['', 'green', 'yellow', 'orange', 'red'];

try {
  const severity = getInput('severity');
  const allWorkspaces = getInput('allWorkspaces') === 'true';
  const recursive = getInput('recursive') === 'true';
  const environment = getInput('environment');
  const command = `yarn npm audit --environment ${environment} ${allWorkspaces ? '--all ' : ''}${recursive ? '--recursive ' : ''}--json`;

  const { stdout: report } = await getExecOutput(command, [], { cwd: process.env.GITHUB_WORKSPACE });
  setOutput('reportJSON', report);

  const reportJson = JSON.parse(report);
  const highestSeverityFound = severities.reduce((highest, current) => reportJson.metadata.vulnerabilities[current] > 0 ? current : highest, undefined);

  if (!highestSeverityFound) {
    console.info('No vulnerability detected.');
  } else {
    console.info(`Highest severity found: ${highestSeverityFound}`);

    const isFailed = severities.indexOf(severity) <= severities.indexOf(highestSeverityFound);

    if (isFailed) {
      console.error(`Found at least one vulnerability equal to or higher than the configured severity threshold: ${severity}.`);
      throw new Error(`Yarn audit found dependencies with vulnerabilities above the severity threshold: ${severity}. Please look at the Audit report.`);
    } else {
      console.info(`Vulnerabilities were detected but all below the configured severity threshold: ${severity}.`);
    }

    const vulnerabilities = Object.values(reportJson.advisories)
      .reduce((acc, vul) => {
        (
          severities.indexOf(severity) <= severities.indexOf(vul.severity)
            ? acc.errors
            : acc.warnings
        ).push(vul);
        return acc;
      }, {errors: [], warnings: []});

    const nbVulnerabilities = Object.values(reportJson.metadata.vulnerabilities).reduce((acc, curr) => acc + curr, 0);

    const getBadge = (sev) => `![${sev}](https://img.shields.io/static/v1?label=&logo=npm&message=${sev}&color=${colors[severities.indexOf(sev)]})`

    const formatVulnerability = (vulnerability) => `
### ${vulnerability.module_name} ${getBadge(vulnerability.severity)}

<details>
  <summary>Details</summary>

${vulnerability.overview.replaceAll('### ', '#### ')}
</details>

`;

    const isVulnerabilityWithKnownSeverity = (a) => severities.indexOf(a.severity) >= 0;

    const sortVulnerabilityBySeverity = (a, b) => severities.indexOf(b.severity) - severities.indexOf(a.severity);

    const body = `# Audit report ${isFailed ? ':x:' : ':white_check_mark:'}

${nbVulnerabilities} vunerabilities founds.

${vulnerabilities.errors.length ? `## Vunerabilities to be fixed

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
Vunerabilities below the threshold: ${severity}
</summary>

${vulnerabilities.warnings
  .filter(isVulnerabilityWithKnownSeverity)
  .sort(sortVulnerabilityBySeverity)
  .map(formatVulnerability)
  .join(os.EOL)
  .replaceAll('${', '&#36;{')
}

</details>
` : ``}
`;
    setOutput('reportMarkdown', body);
  }
} catch (error) {
  setFailed(error.message);
}
