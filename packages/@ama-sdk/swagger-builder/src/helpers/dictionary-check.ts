import { Report } from '../core/checkers/checker.interface';
import { DictionaryChecker } from '../core/checkers/dictionary-checker';
import { getTargetInformation } from '../core/utils';

/**
 *
 * @param specificationPaths
 */
export async function checkDictionaries(specificationPaths: string[]) {

  const checker = new DictionaryChecker();
  const reports: {[swaggerSpec: string]: Report} = {};
  for (const specPath of specificationPaths) {
    const spec = await getTargetInformation(specPath);
    const report = await checker.check(spec);
    if (report && report.length > 0) {
      reports[specPath] = report;
    }
  }

  return reports;
}
