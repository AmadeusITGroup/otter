import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import {
  setupTestBed,
} from '@analogjs/vitest-angular/setup-testbed';
import 'isomorphic-fetch';

setupTestBed();

// Need to add this because jsdom doesn't support Response.json yet
if (!Response.json) {
  Response.json = (data, init) =>
    // eslint-disable-next-line unicorn/prefer-response-static-json -- not supported by jsdom
    new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    });
}
