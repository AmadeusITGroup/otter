const cheerio = require('cheerio');
const expressInterceptor = require('express-interceptor');

/**
 * Injects bootstrapconfig inside the body dataset to get all debug/override capabilities on a local development server
 */
export const bootstrapConfigMiddleware = () => expressInterceptor((_req: {[x: string]: any}, res: { [x: string]: any }) => ({
  isInterceptable: () => /text\/html/.test(res.get('Content-Type')),
  intercept: (body: string, send: (data: string) => void) => {
    const file = cheerio.load(body);

    file('body').attr('data-bootstrapconfig', JSON.stringify({allowParamOverride: true}));

    send(file.html());
  }
}));
