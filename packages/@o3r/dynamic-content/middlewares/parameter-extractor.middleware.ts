import * as querystring from 'node:querystring';
import * as cheerio from 'cheerio';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- no type are provided for express-interceptor
import * as expressInterceptor from 'express-interceptor';

let previousPostParams = {};

const middleware = () => expressInterceptor((req: { [x: string]: any }, res: { [x: string]: any }) => ({
  isInterceptable: () => /text\/html/.test(res.get('Content-Type')),
  intercept: (body: string, send: (data: string) => void) => {
    // Burn query and post parameters in a script inside index.html
    const file = cheerio.load(body);

    file('body').attr('data-query', JSON.stringify(req.query));
    file('body').attr('data-post', JSON.stringify(previousPostParams));

    // Remove previously stored parameters
    previousPostParams = {};

    send(file.html());
  }
}));

/**
 *
 */
export function setup(app: { [x: string]: any }) {
  app.post('*', (req: { [x: string]: any }, res: { [x: string]: any }) => {
    // Retrieve Body Params and convert to map
    let data = '';
    req.on('data', (chunk: Buffer) => (data += chunk.toString()));
    req.on('end', () => (previousPostParams = querystring.parse(data)));

    res.redirect(req.originalUrl);
  });

  app.use(middleware());
}
