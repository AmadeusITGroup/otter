import 'isomorphic-fetch';
import {
  setupZoneTestEnv,
} from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Need to add this because jsdom doesn't support Response.json yet
if (!Response.json) {
  Response.json = (data: any, init?: ResponseInit) =>
    // eslint-disable-next-line unicorn/prefer-response-static-json -- not supported by jsdom
    new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    });
}
