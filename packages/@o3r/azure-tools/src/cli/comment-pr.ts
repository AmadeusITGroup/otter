#!/usr/bin/env node

import {
  Option,
  program
} from 'commander';
import * as winston from 'winston';
import {
  PullRequestService
} from '../helpers/index';

let comment: string | undefined;
/**
 * How to use
 * yarn dlx -p @o3r/azure-tools o3r-comment-pr "[Deployed app]($(url))" -s Closed -I app-link -m Replace -T $(System.AccessToken)
 */
program
  .arguments('<comment>')
  .description('Comment a Pull Request')
  .addOption(new Option('-s, --commentStatus <commentStatus>', 'Comment status')
    .choices(['Unknown', 'Active', 'Fixed', 'WontFix', 'Closed', 'ByDesign', 'Pending'])
    .default('Closed')
  )
  .addOption(new Option('-m, --mode <mode>', 'Replaces thread if existing | Adds a comment to the existing thread | Do anything if thread already exists')
    .choices(['Replace', 'Add', 'Skip'])
    .default('Add')
  )
  .option('-I, --threadIdentifier <threadIdentifier>', 'Thread identifier', undefined)
  .requiredOption('-T, --accessToken <accessToken>', 'Access token')
  .action((actionComment: string) => {
    comment = actionComment;
  })
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

void (async () => {
  logger.info('Commenting PR...');

  if (!comment) {
    throw new Error('A comment must be provided');
  }
  if (!process.env.SYSTEM_TEAMPROJECT) {
    throw new Error('System.TeamProject must be provided');
  }
  if (!process.env.BUILD_REPOSITORY_NAME) {
    throw new Error('Build.Repository.Name must be provided');
  }
  if (!process.env.SYSTEM_PULLREQUEST_PULLREQUESTID) {
    throw new Error('System.PullRequest.PullRequestId must be provided');
  } else if (Number.isNaN(+process.env.SYSTEM_PULLREQUEST_PULLREQUESTID)) {
    throw new Error('System.PullRequest.PullRequestId must be a number');
  }
  if (!process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI) {
    throw new Error('System.TeamFoundationCollectionUri must be provided');
  }

  const project = process.env.SYSTEM_TEAMPROJECT;
  const repositoryId = process.env.BUILD_REPOSITORY_NAME;
  const pullRequestId = +process.env.SYSTEM_PULLREQUEST_PULLREQUESTID;
  const orgUrl = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;

  const prService = new PullRequestService(opts.accessToken, project, orgUrl, logger);
  const threads = opts.threadIdentifier ? await prService.findThreadsByIdentifier(repositoryId, pullRequestId, opts.threadIdentifier) : [];

  if (opts.mode === 'Replace') {
    await Promise.all(threads.filter((thread) => !!thread.id).map((thread) => prService.deleteThread(repositoryId, pullRequestId, thread.id!)));
  }
  if (opts.mode === 'Replace' || threads.length === 0) {
    await prService.addThread(repositoryId, pullRequestId, comment, opts.commentStatus, opts.threadIdentifier);
  } else if (opts.mode === 'Add') {
    await Promise.all(
      threads.map((thread) => prService.addCommentToThread(repositoryId, pullRequestId, thread, comment!))
    );
  }
})();
