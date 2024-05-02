/**
 * Add a preconnect `<link>` element to the DOM
 * @param baseUrl the origin href
 * @param supportCrossOrigin add crossorigin attribute to the link element
 */
export function appendPreconnect(baseUrl: string, supportCrossOrigin = true): void {
  const preConnectLink = document.createElement('link');
  preConnectLink.setAttribute('rel', 'preconnect');
  preConnectLink.setAttribute('href', baseUrl);
  if (supportCrossOrigin) {
    preConnectLink.setAttribute('crossorigin', '');
  }
  document.head.appendChild(preConnectLink);
}
