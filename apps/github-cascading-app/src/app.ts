import type { Probot } from 'probot';
import { CascadingProbot } from './cascading/cascading-probot';

export = (app: Probot) => {

  app.on(['push'], async (context) => {
    const logger = context.log;
    const branch = context.payload.ref.replace(/^refs\/heads\//, '');
    const cascadingPlugin = new CascadingProbot({
      logger,
      octokit: context.octokit,
      repo: context.repo(),
      appId: context.payload.installation?.id
    });
    try {
      await cascadingPlugin.cascade(branch);
    } catch (error) {
      logger.error('Caught an error during the cascading execution');
      logger.error(JSON.stringify(error, null, 2));
    }
  });

  app.on(['pull_request.closed'], async (context) => {
    const logger = context.log;
    const cascadingPlugin = new CascadingProbot({
      logger,
      octokit: context.octokit,
      repo: context.repo(),
      appId: context.payload.installation?.id
    });
    try {
      const reevaluateBranch = await cascadingPlugin.branchToReevaluateCascading({
        body: context.payload.pull_request.body,
        id: context.payload.pull_request.number
      });
      if (reevaluateBranch) {
        await cascadingPlugin.cascade(reevaluateBranch);
      }
    } catch (error) {
      logger.error('Caught an error during the cascading execution');
      logger.error(JSON.stringify(error, null, 2));
    }
  });

  app.on('check_suite.completed', async (context) => {
    const logger = context.log;
    const repo = context.repo();
    const cascadingPlugin = new CascadingProbot({
      logger,
      octokit: context.octokit,
      repo,
      appId: context.payload.installation?.id
    });
    if (context.payload.check_suite.status !== 'completed') {
      logger.debug(`The check suite ${context.payload.check_suite.id} is not passed yet`);
      return;
    }
    if (!['neutral', 'success'].some((status) => context.payload.check_suite.conclusion === status)) {
      logger.debug(`The check suite ${context.payload.check_suite.id} is not passed yet`);
      return;
    }
    await Promise.all(
      context.payload.check_suite.pull_requests
        .map(async ({id, head}) => {
          try {
            const branch = head.ref.replace(/^refs\/heads\//, '');
            await cascadingPlugin.mergeCascadingPullRequest({ id }, branch, context.payload.check_suite.conclusion);
          } catch (error: any) {
            context.octokit.log.error(`Caught an error during the merge execution on PR ${id}`, error);
          }
        })
    );
  });
};
