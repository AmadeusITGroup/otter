import {
  app as azureApp,
  type HttpRequest
} from '@azure/functions';
import {
  createProbot,
  type Probot
} from 'probot';
import app from '../app';

type EventName = Parameters<Probot['webhooks']['verifyAndReceive']>[0]['name'];

const probotInstance = createProbot();
void probotInstance.load(app);
azureApp.http('github-cascading', {
  methods: ['GET', 'POST'],
  handler: async (req: HttpRequest) => {
    await probotInstance.webhooks.verifyAndReceive({
      id: req.headers.get('X-GitHub-Delivery') || req.headers.get('x-github-delivery')!,
      name: (req.headers.get('X-GitHub-Event') || req.headers.get('x-github-event')) as EventName,
      signature:
        req.headers.get('X-Hub-Signature-256')
        || req.headers.get('x-hub-signature-256')
        || req.headers.get('X-Hub-Signature')
        || req.headers.get('x-hub-signature')!,
      payload: await req.text()
    });

    return { status: 200, body: 'ok' };
  }
});
