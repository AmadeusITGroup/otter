import {
  Formatter
} from '../core/formatters/formatter.interface';
import {
  JsonFormatter
} from '../core/formatters/json-formatter';
import {
  SplitYamlFormatter
} from '../core/formatters/split-yaml-formatter';
import {
  YamlFormatter
} from '../core/formatters/yaml-formatter';
import {
  SwaggerSpecMerger
} from '../core/swagger-spec-merger';
import {
  SwaggerSpecSplit
} from '../core/swagger-spec-wrappers/swagger-spec-split';
import {
  getCurrentArtifactVersion,
  getTargetInformation
} from '../core/utils';
import {
  BuilderApiConfiguration
} from '../interfaces/apis-configuration';
import {
  BuilderConfiguration,
  OutputFormat
} from '../interfaces/builder-configuration';
import {
  applyPostProcess
} from './post-process';

/**
 * Build a Swagger specification by merging the specifications in input
 * @param configuration Configuration of the build
 * @param inputs List of YAML Swagger Spec paths, Config Json paths or Api Configuration objects to build
 */
export async function buildSpecs(configuration: BuilderConfiguration, inputs: (string | { path: string; config: BuilderApiConfiguration })[] = []) {
  const formatters: { [x in OutputFormat]: Formatter } = {
    json: new JsonFormatter(configuration.output),
    yaml: new YamlFormatter(configuration.output),
    split: new SplitYamlFormatter(configuration.output)
  };

  const specs = await Promise.all(
    [...(configuration.specs || []), ...inputs].map((input) => {
      return typeof input === 'string' ? getTargetInformation(input) : new SwaggerSpecSplit(input, 'LocalPath');
    })
  );
  const specMerger = new SwaggerSpecMerger(specs);
  const formatter = formatters[configuration.outputFormat];
  const swaggerSpec = await specMerger.build({
    setVersion: configuration.setVersion || (configuration.setVersionAuto ? await getCurrentArtifactVersion() : undefined),
    ignoreConflict: configuration.ignoreConflict || false
  });
  const finalSwaggerSpec = await applyPostProcess(configuration, swaggerSpec);

  await formatter.generate(finalSwaggerSpec);
  if (configuration.artifact) {
    await formatter.generateArtifact(configuration.artifact, finalSwaggerSpec);
  }
}
