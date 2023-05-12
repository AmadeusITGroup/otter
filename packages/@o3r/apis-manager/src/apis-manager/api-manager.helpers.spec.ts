import { appendPreconnect } from './api-manager.helpers';

describe('appendPreconnect', () => {
  beforeEach(() => {
    const fakeDom = `
      <html>
        <head></head>
        <body></body>
      </html>
    `;
    document.documentElement.innerHTML = fakeDom;
  });

  test('should append preconnect link element to the DOM', () => {
    appendPreconnect('https://example.com');
    const preConnectLink = document.querySelector('link[rel="preconnect"][href="https://example.com"]');
    expect(preConnectLink).not.toBeNull();
  });

  test('should add crossorigin attribute', () => {
    appendPreconnect('https://example.com', true);
    const preConnectLink = document.querySelector('link[rel="preconnect"][href="https://example.com"][crossorigin]');
    expect(preConnectLink).not.toBeNull();
  });

  test('should not add crossorigin attribute', () => {
    appendPreconnect('https://example.com', false);
    const preConnectLink = document.querySelector('link[rel="preconnect"][href="https://example.com"][crossorigin]');
    expect(preConnectLink).toBeNull();
  });
});
