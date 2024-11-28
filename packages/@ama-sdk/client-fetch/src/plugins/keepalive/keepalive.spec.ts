import type {
  RequestOptions,
} from '@ama-sdk/core';
import {
  KeepaliveRequest,
} from './keepalive.request';

describe('Keepalive Request Plugin', () => {
  const options: RequestOptions = { headers: new Headers(), basePath: 'http://test.com/truc', method: 'get' };

  it('keepalive should be set to true', async () => {
    const plugin = new KeepaliveRequest(true);
    const runner = plugin.load();

    await runner.transform(options);
    const keepalive = (await plugin.load().transform(options)).keepalive;

    expect(keepalive).toBe(true);
  });
});
