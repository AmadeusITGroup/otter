import { createProbot, Probot } from 'probot';
import type { Context, HttpRequest } from '@azure/functions';
import app from '../app';

/**
 * Handle Webhooks from Github
 *
 * @param probot Instance of probot
 * @param context Request context
 * @param req HTTP Request
 */
async function azureFunction(probot: Probot, context: Context, req: HttpRequest) {
  await probot.webhooks.verifyAndReceive({
    id: req.headers['X-GitHub-Delivery'] || req.headers['x-github-delivery'],
    name: req.headers['X-GitHub-Event'] || req.headers['x-github-event'] as any,
    signature:
      req.headers['X-Hub-Signature-256'] ||
      req.headers['x-hub-signature-256'] ||
      req.headers['X-Hub-Signature'] ||
      req.headers['x-hub-signature'],
    payload: req.rawBody
  });

  context.res = {
    status: '200',
    body: 'ok'
  };
}

const probotInstance = createProbot();
void probotInstance.load(app);
export = azureFunction.bind(null, probotInstance);
