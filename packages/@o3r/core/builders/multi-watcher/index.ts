import { BuilderOutput, createBuilder, Target } from '@angular-devkit/architect';
import { createBuilderWithMetricsIfInstalled } from '../utils';
import { MultiWatcherBuilderSchema } from './schema';

export default createBuilder<MultiWatcherBuilderSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();

  /** List of parallel build references */
  const processes = options.targets
    .map((targetStr) => targetStr.split(':'))
    .map(([project, target, configuration]) => ({ project, target, configuration }))
    .map(async (target: Target) => {
      const baseOptions = await context.getTargetOptions(target);
      const builderName = await context.getBuilderNameForTarget(target);
      const buildOptions = await context.validateOptions({ ...baseOptions, watch: true }, builderName)
        .catch(() => context.validateOptions(baseOptions, builderName));

      if (buildOptions && typeof buildOptions.watch !== 'undefined') {
        buildOptions.watch = true;
      }

      return context.scheduleTarget(target, buildOptions, { logger: context.logger.createChild(target.target)});
    });

  const builds = await Promise.all(processes);

  /** First build that stopped / crashed */
  const firstStopped = Promise.race(
    builds.map((build) =>
      new Promise<BuilderOutput>((_resolve, reject) => {
        build.result.catch((e) => reject(e));
      })
    )
  );

  // Stop all builds if the multi-watcher stops
  context.addTeardown(async () => {
    await Promise.all(builds.map((build) => build.stop()));
  });

  return firstStopped;
}));
