import * as core from '@actions/core';
import {getExecOutput} from '@actions/exec';
import * as os from 'node:os';
import type { GitHubAdvisoryId, NPMAuditReportV1, Severity } from 'audit-types';
type Audit = NPMAuditReportV1.Audit;
type Advisory = NPMAuditReportV1.Advisory;

/**
 * Severities supported by yarn npm audit from the lowest to the highest criticality
 */
const severities: Severity[] = ['info', 'low', 'moderate', 'high', 'critical'];
const colors = ['', 'green', 'yellow', 'orange', 'red'];

/**
 * Interface to describe Yarn 4+ npm audit response.
 * It is not yet covered by audit-types
 */
interface Yarn4AuditResponse {
  value: string;
  children: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ID: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Issue: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Severity: Severity;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Vulnerable Versions': string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Tree Versions': string[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Dependents: string[];
  };
}

/**
 * Description of an advisory as it will be displayed in the action summary
 */
interface OtterAdvisory {
  severity: Severity;
  overview: string;
  moduleName: string;
}

/**
 * Data to build the action report summary
 */
interface OtterAuditReport {
  nbVulnerabilities: number;
  errors: OtterAdvisory[];
  warnings: OtterAdvisory[];
  highestSeverityFound?: Severity;
}

/**
 * Format the response from yarn 4 npm audit in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
function computeYarn4Report(response: string, severityThreshold: Severity): OtterAuditReport {
  core.info('Computing Report for Yarn 4');
  const reports = response.split('\n').filter((a) => !!a);
  const severityThresholdIndex = severities.indexOf(severityThreshold);
  return reports.reduce((currentReport, currentVulnerability) => {
    const vulnerabilityReport: Yarn4AuditResponse = JSON.parse(currentVulnerability);
    const vulnerabilitySeverity = vulnerabilityReport.children.Severity || 'info';
    const severityIndex = severities.indexOf(vulnerabilitySeverity);
    if (severityIndex >= severityThresholdIndex) {
      currentReport.errors.push({
        severity: vulnerabilitySeverity,
        moduleName: vulnerabilityReport.value,
        overview: vulnerabilityReport.children.Issue
      });
    } else {
      currentReport.warnings.push({
        severity: vulnerabilitySeverity,
        moduleName: vulnerabilityReport.value,
        overview: `This issue affects versions ${vulnerabilityReport.children['Vulnerable Versions']}. ${vulnerabilityReport.children.Issue}`
      });
    }
    currentReport.highestSeverityFound = severities.indexOf(currentReport.highestSeverityFound || 'info') <= severities.indexOf(vulnerabilitySeverity)
      ? vulnerabilitySeverity
      : currentReport.highestSeverityFound;
    currentReport.nbVulnerabilities += 1;
    return currentReport;
  }, {nbVulnerabilities: 0, errors: [], warnings: []} as OtterAuditReport);
}

/**
 * Format the response from yarn 3 npm audit in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
function computeYarn3Report(response: string, severityThreshold: Severity): OtterAuditReport {
  core.info('Computing Report for Yarn 3');
  const reportJson = JSON.parse(response) as Audit;
  core.debug(response);
  const nbVulnerabilities = Object.values(reportJson.metadata.vulnerabilities as { [key: string]: number } || {}).reduce((acc, curr) => acc + curr, 0);
  let highestSeverityFound: Severity | undefined;
  for (let index = severities.length; index >= 0; index--) {
    const severity: Severity = severities[index];
    if (reportJson.metadata.vulnerabilities[severity] > 0) {
      highestSeverityFound = severity;
      break;
    }
  }
  return Object.values(reportJson.advisories as Readonly<Record<GitHubAdvisoryId, Advisory>>)
    .reduce<OtterAuditReport>((currentVulnerabilities, advisory: Advisory) => {
      core.info(`${severities.indexOf(severityThreshold)} - ${severities.indexOf(advisory.severity)}`);
      if (severities.indexOf(severityThreshold) <= severities.indexOf(advisory.severity)) {
        currentVulnerabilities.errors.push({severity: advisory.severity, overview: advisory.overview, moduleName: advisory.module_name});
      } else {
        currentVulnerabilities.warnings.push({severity: advisory.severity, overview: advisory.overview, moduleName: advisory.module_name});
      }
      return currentVulnerabilities;
    }, {errors: [], warnings: [], nbVulnerabilities, highestSeverityFound} as OtterAuditReport);
}

async function run(): Promise<void> {

  try {
    const severityConfig = core.getInput('severity') as Severity;
    const allWorkspaces = core.getInput('allWorkspaces') === 'true';
    const recursive = core.getInput('recursive') === 'true';
    const environment = core.getInput('environment');
    const versionOutput = await getExecOutput('yarn --version', [], {cwd: process.env.GITHUB_WORKSPACE});
    const version = Number.parseInt(versionOutput.stdout.split('.')[0], 10);
    const command = `yarn npm audit --environment ${environment} ${allWorkspaces ? '--all ' : ''}${recursive ? '--recursive ' : ''}--json`;

    const {stdout: report, stderr: err} = await getExecOutput(command, [], {cwd: process.env.GITHUB_WORKSPACE, ignoreReturnCode: true});
    core.warning(err);
    core.setOutput('reportJSON', report);
    const reportData: OtterAuditReport = version >= 4 ? computeYarn4Report(report, severityConfig) : computeYarn3Report(report, severityConfig);

    if (reportData.highestSeverityFound) {
      core.info(`Highest severity found: ${reportData.highestSeverityFound}`);
    } else {
      core.info('No vulnerability detected.');
      return;
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

    const isVulnerabilityWithKnownSeverity = (advisory: OtterAdvisory) => severities.includes(advisory.severity);

    const sortVulnerabilityBySeverity = (advisory1: OtterAdvisory, advisory2: OtterAdvisory) => severities.indexOf(advisory2.severity) - severities.indexOf(advisory1.severity);

    const body = `# Audit report ${isFailed ? ':x:' : ':white_check_mark:'}

${reportData.nbVulnerabilities} vulnerabilities found.

${reportData.errors.length > 0
    ? `## Vulnerabilities to be fixed

${reportData.errors
    .filter(isVulnerabilityWithKnownSeverity)
    .sort(sortVulnerabilityBySeverity)
    .map(formatVulnerability)
    .join(os.EOL)
}
`
    : ''}
${reportData.warnings.length > 0
    ? `___

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
`
    : ''}
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
