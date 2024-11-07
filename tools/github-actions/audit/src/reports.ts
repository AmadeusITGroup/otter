import * as core from '@actions/core';
import type {
  GitHubAdvisoryId,
  NPMAuditReportV1,
  NPMAuditReportV2,
  Severity,
  YarnAudit,
  YarnNpmAuditReport
} from 'audit-types';

type Audit = NPMAuditReportV1.Audit;
type Advisory = NPMAuditReportV1.Advisory;

/**
 * Severities supported by npm audit from the lowest to the highest criticality
 */
export const severities = ['info', 'low', 'moderate', 'high', 'critical'] as const satisfies Severity[];

/**
 * Description of an advisory as it will be displayed in the action summary
 */
export interface OtterAdvisory {
  /** Severity of the vulnerability */
  severity: Severity;
  /** Overview of the vulnerability */
  overview: string;
  /** Name of the module affected by the vulnerability */
  moduleName: string;
}

/**
 * Data to build the action report summary
 */
export interface OtterAuditReport {
  /** Total number of vulnerabilities */
  nbVulnerabilities: number;
  /** List of vulnerabilities that exceed the severity threshold */
  errors: OtterAdvisory[];
  /** List of vulnerabilities that don't exceed the severity threshold */
  warnings: OtterAdvisory[];
  /** Highest severity found in the list of vulnerabilities */
  highestSeverityFound?: Severity;
}

/**
 * Method which formats the response of an audit api (yarn or npm) into a report that can be displayed in the
 * GitHub action summary
 * @param response The output of the audit command
 * @param severityThreshold The severity threshold to consider a vulnerability as an error
 */
export type OtterAuditReporter = (response: string, severityThreshold: Severity) => OtterAuditReport;

function computeTotalsForSeverities(severityAccessor: (severity: Severity) => number) {
  let highestSeverityFound: Severity | undefined;
  let nbVulnerabilities = 0;
  for (let index = severities.length - 1; index >= 0; index--) {
    const severity: Severity = severities[index];
    const severityTotal = severityAccessor(severity);
    if (!highestSeverityFound && severityTotal > 0) {
      highestSeverityFound = severity;
    }
    nbVulnerabilities += severityTotal;
  }
  return { highestSeverityFound, nbVulnerabilities };
}

function updateReportWithVulnerability(currentReport: OtterAuditReport, severityThreshold: Severity, vulnerability: OtterAdvisory): OtterAuditReport {
  const severityThresholdIndex = severities.indexOf(severityThreshold);
  const severityIndex = severities.indexOf(vulnerability.severity);
  if (severityIndex >= severityThresholdIndex) {
    currentReport.errors.push(vulnerability);
  } else {
    currentReport.warnings.push(vulnerability);
  }
  return currentReport;
}

/**
 * Format the response from npm audit V1 in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
export const computeNpmV1Report: OtterAuditReporter = (response, severityThreshold) => {
  const reportJson = JSON.parse(response) as Audit;
  core.debug(response);
  const { nbVulnerabilities, highestSeverityFound } = computeTotalsForSeverities((severity) => reportJson.metadata.vulnerabilities[severity]);
  return Object.values(reportJson.advisories as Readonly<Record<GitHubAdvisoryId, Advisory>>)
    .reduce<OtterAuditReport>((currentVulnerabilities, advisory: Advisory) =>
      updateReportWithVulnerability(currentVulnerabilities, severityThreshold, {
        severity: advisory.severity,
        overview: advisory.overview,
        moduleName: advisory.module_name
      })
    , { errors: [], warnings: [], nbVulnerabilities, highestSeverityFound });
};

/**
 * Format the response from npm audit V2 in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
export const computeNpmV2Report: OtterAuditReporter = (response, severityThreshold) => {
  const reportJson = JSON.parse(response) as NPMAuditReportV2.Audit;
  core.debug(response);
  const { nbVulnerabilities, highestSeverityFound } = computeTotalsForSeverities((severity) => reportJson.metadata.vulnerabilities[severity]);
  return Object.values(reportJson.vulnerabilities)
    .reduce<OtterAuditReport>((currentVulnerabilities, advisory) =>
      updateReportWithVulnerability(currentVulnerabilities, severityThreshold, {
        severity: advisory.severity,
        moduleName: advisory.name,
        overview: typeof advisory.via[0] === 'string' ? advisory.via[0] : advisory.via[0].title
      })
    , { errors: [], warnings: [], nbVulnerabilities, highestSeverityFound });
};

/**
 * Format the response from npm audit in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
export const computeNpmReport: OtterAuditReporter = (response, severityThreshold) => {
  core.info('Computing Report for Npm');
  const reportJson = JSON.parse(response) as NPMAuditReportV2.Audit | NPMAuditReportV1.Audit;
  return 'auditReportVersion' in reportJson && reportJson.auditReportVersion === 2 ? computeNpmV2Report(response, severityThreshold) : computeNpmV1Report(response, severityThreshold);
};

/**
 * Format the response from yarn 1 npm audit in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
export const computeYarn1Report: OtterAuditReporter = (response, severityThreshold) => {
  core.info('Computing Report for Yarn 1');
  const reports = response.split('\n').filter((a) => !!a).map((report) => JSON.parse(report)) as YarnAudit.AuditResponse[];
  const reportSummary = reports.find((report): report is YarnAudit.AuditSummary => report.type === 'auditSummary');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Wrong typings in 'audit-types'
  const { nbVulnerabilities, highestSeverityFound } = computeTotalsForSeverities((severity) => (reportSummary?.data as any).vulnerabilities[severity]);
  return reports.filter((report): report is YarnAudit.AuditAdvisory => report.type === 'auditAdvisory')
    .reduce<OtterAuditReport>((currentVulnerabilities, advisory) =>
      updateReportWithVulnerability(currentVulnerabilities, severityThreshold, {
        severity: advisory.data.advisory.severity,
        moduleName: advisory.data.advisory.module_name,
        overview: advisory.data.advisory.overview
      })
    , { errors: [], warnings: [], nbVulnerabilities, highestSeverityFound });
};

/**
 * Format the response from yarn 2 and 3 npm audit in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
export const computeYarn3Report: OtterAuditReporter = (response, severityThreshold) => {
  core.info('Computing Report for Yarn 2 and 3');
  return computeNpmReport(response, severityThreshold);
};

/**
 * Format the response from yarn 4 npm audit in a common interface that will be used to build the
 * report summary
 * @param response
 * @param severityThreshold
 */
export const computeYarn4Report: OtterAuditReporter = (response, severityThreshold) => {
  core.info('Computing Report for Yarn 4');
  const reports = response.split('\n').filter((a) => !!a);
  return reports.reduce((currentReport, currentVulnerability) => {
    const vulnerabilityReport = JSON.parse(currentVulnerability) as YarnNpmAuditReport.AuditResponse;
    const vulnerabilitySeverity = vulnerabilityReport.children.Severity || 'info';
    currentReport = updateReportWithVulnerability(currentReport, severityThreshold, {
      severity: vulnerabilitySeverity,
      moduleName: vulnerabilityReport.value,
      overview: `This issue affects versions ${vulnerabilityReport.children['Vulnerable Versions']}. ${vulnerabilityReport.children.Issue}`
    });
    currentReport.highestSeverityFound = severities.indexOf(currentReport.highestSeverityFound || 'info') <= severities.indexOf(vulnerabilitySeverity)
      ? vulnerabilitySeverity
      : currentReport.highestSeverityFound;
    currentReport.nbVulnerabilities += 1;
    return currentReport;
  }, { nbVulnerabilities: 0, errors: [], warnings: [] } as OtterAuditReport);
};
