import {
  getHostInfo,
  MFE_HOST_APPLICATION_ID_PARAM,
  MFE_HOST_URL_PARAM,
  MFE_MODULE_APPLICATION_ID_PARAM,
  MFEHostInformation,
} from './host-info';

describe('HostInfo', () => {
  const expectedHostInfo = {
    hostURL: 'expected-url',
    hostApplicationId: 'expected-application-id',
    moduleApplicationId: 'expected-module-application-id'
  } as const satisfies MFEHostInformation;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'location', { value: {
      search: '',
      ancestorOrigins: ['unexpected-url']
    }, writable: true });
    Object.defineProperty(globalThis.document, 'referrer', { value: 'unexpected-url', writable: true });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getHostInfo', () => {
    it('should get host info from search parameters', () => {
      globalThis.location.search = new URLSearchParams({
        [MFE_HOST_APPLICATION_ID_PARAM]: expectedHostInfo.hostApplicationId,
        [MFE_HOST_URL_PARAM]: expectedHostInfo.hostURL,
        [MFE_MODULE_APPLICATION_ID_PARAM]: expectedHostInfo.moduleApplicationId
      }).toString();
      const hostInfo = getHostInfo();
      expect(hostInfo.hostApplicationId).toBe(expectedHostInfo.hostApplicationId);
      expect(hostInfo.moduleApplicationId).toBe(expectedHostInfo.moduleApplicationId);
      expect(hostInfo.hostURL).toBe(expectedHostInfo.hostURL);
    });

    it('should get host info from session storage', () => {
      const getItemSpy = jest.spyOn(Object.getPrototypeOf(globalThis.sessionStorage), 'getItem').mockReturnValue(JSON.stringify(expectedHostInfo));
      const hostInfo = getHostInfo();
      expect(getItemSpy).toHaveBeenCalled();
      expect(hostInfo.hostApplicationId).toBe(expectedHostInfo.hostApplicationId);
      expect(hostInfo.moduleApplicationId).toBe(expectedHostInfo.moduleApplicationId);
      expect(hostInfo.hostURL).toBe(expectedHostInfo.hostURL);
    });

    it('should get host url from location ancestorOrigins', () => {
      Object.defineProperty(globalThis, 'location', { value: {
        search: '',
        ancestorOrigins: [expectedHostInfo.hostURL]
      } });
      const hostInfo = getHostInfo();
      expect(hostInfo.hostURL).toBe(expectedHostInfo.hostURL);
    });

    it('should get host url from document referrer', () => {
      Object.defineProperty(globalThis, 'location', { value: {
        search: '',
        ancestorOrigins: []
      } });
      Object.defineProperty(globalThis.document, 'referrer', { value: expectedHostInfo.hostURL });
      const hostInfo = getHostInfo();
      expect(hostInfo.hostURL).toBe(expectedHostInfo.hostURL);
    });
  });
});
