import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { StorageStrategy } from './request-parameters.config';
import { RequestParametersModule } from './request-parameters.module';
import { RequestParametersService } from './request-parameters.service';


class FakeStorage implements Storage {
  private storage: any = {};

  public setItem(key: string, value: any = '') {
    this.storage[key] = value;
  }

  public getItem(key: string) {
    return key in this.storage ? this.storage[key] : null;
  }

  public removeItem(key: string) {
    delete this.storage[key];
  }

  public get length() {
    return Object.keys(this.storage).length;
  }

  public key(i: number) {
    const keys = Object.keys(this.storage);
    return keys[i] || null;
  }

  public clear() {
    this.storage = {};
  }
}

let service: RequestParametersService;
const sessionCustomStorage = new FakeStorage();
const localCustomStorage = new FakeStorage();

describe('RequestParametersService', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  const queryParams = '{"qParam1":"q1","qParam2":"q2","qParam3":"true","qParam4":"false"}';
  const postParams = '{"pParam1":"p1","pParam2":"p2","pParam3":"true","pParam4":"false"}';

  const presetQueryParams = '{"presetQParam":"1"}';
  const presetPostParams = '{"presetPParam":"1"}';

  describe('Default service without data in the storage (rehydrate strategy)', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();

      const getConfiguration = () => ({
        queryParamsValue: queryParams,
        postParamsValue: postParams,
        storage: sessionCustomStorage
      });

      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should set session storage _query', () => {
      expect(sessionCustomStorage.getItem('_query')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_query')!)).toEqual(JSON.parse(queryParams));
    });

    it('should set property query', () => {
      expect(service.query).toEqual(JSON.parse(queryParams));
    });

    it('should return the right query parameter', () => {
      expect(service.getQueryParameter('qParam1')).toEqual('q1');
      expect(service.getQueryParameter('qParam2')).toEqual('q2');
      expect(service.getQueryParameter('qParam3')).toEqual('true');
      expect(service.getQueryParameter('qParam4')).toEqual('false');
      expect(service.getQueryParameter('notExist')).toBeUndefined();
    });

    it('should return the right query parameter as boolean', () => {
      expect(service.getQueryParameterAsBoolean('qParam1')).toEqual(false);
      expect(service.getQueryParameterAsBoolean('qParam2')).toEqual(false);
      expect(service.getQueryParameterAsBoolean('qParam3')).toEqual(true);
      expect(service.getQueryParameterAsBoolean('qParam4')).toEqual(false);
      expect(service.getQueryParameterAsBoolean('notExist')).toBeUndefined();
    });

    it('should set session storage _post', () => {
      expect(sessionCustomStorage.getItem('_post')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_post')!)).toEqual(JSON.parse(postParams));
    });

    it('should set property post', () => {
      expect(service.post).toEqual(JSON.parse(postParams));
    });

    it('should return the right post parameter', () => {
      expect(service.getPostParameter('pParam1')).toEqual('p1');
      expect(service.getPostParameter('pParam2')).toEqual('p2');
      expect(service.getPostParameter('pParam3')).toEqual('true');
      expect(service.getPostParameter('pParam4')).toEqual('false');
      expect(service.getPostParameter('notExist')).toBeUndefined();
    });

    it('should return the right post parameter as boolean', () => {
      expect(service.getPostParameterAsBoolean('pParam1')).toEqual(false);
      expect(service.getPostParameterAsBoolean('pParam2')).toEqual(false);
      expect(service.getPostParameterAsBoolean('pParam3')).toEqual(true);
      expect(service.getPostParameterAsBoolean('pParam4')).toEqual(false);
      expect(service.getPostParameterAsBoolean('notExist')).toBeUndefined();
    });

    it('should return the right parameter', () => {
      expect(service.getParameter('qParam1')).toEqual('q1');
      expect(service.getParameter('qParam2')).toEqual('q2');
      expect(service.getParameter('qParam3')).toEqual('true');
      expect(service.getParameter('qParam4')).toEqual('false');
      expect(service.getParameter('pParam1')).toEqual('p1');
      expect(service.getParameter('pParam2')).toEqual('p2');
      expect(service.getParameter('pParam3')).toEqual('true');
      expect(service.getParameter('pParam4')).toEqual('false');
      expect(service.getParameter('notExist')).toBeUndefined();
    });

    it('should return the right parameter as boolean', () => {
      expect(service.getParameterAsBoolean('qParam1')).toEqual(false);
      expect(service.getParameterAsBoolean('qParam2')).toEqual(false);
      expect(service.getParameterAsBoolean('qParam3')).toEqual(true);
      expect(service.getParameterAsBoolean('qParam4')).toEqual(false);
      expect(service.getParameterAsBoolean('pParam1')).toEqual(false);
      expect(service.getParameterAsBoolean('pParam2')).toEqual(false);
      expect(service.getParameterAsBoolean('pParam3')).toEqual(true);
      expect(service.getParameterAsBoolean('pParam4')).toEqual(false);
      expect(service.getParameterAsBoolean('notExist')).toBeUndefined();
    });
  });

  describe('Rehydrate with already data in the storage', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
      sessionCustomStorage.setItem('_query', presetQueryParams);
      sessionCustomStorage.setItem('_post', presetPostParams);

      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(() => ({
          strategy: StorageStrategy.Rehydrate,
          storage: sessionCustomStorage
        }))]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should not modify session storage _query', () => {
      expect(sessionCustomStorage.getItem('_query')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_query')!)).toEqual(expect.objectContaining(JSON.parse(presetQueryParams)));
    });

    it('should rehydrate query data from the session storage', () => {
      expect(service.query).toEqual(expect.objectContaining(JSON.parse(presetQueryParams)));
    });

    it('should not modify session storage _post', () => {
      expect(sessionCustomStorage.getItem('_post')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_post')!)).toEqual(expect.objectContaining(JSON.parse(presetPostParams)));
    });

    it('should rehydrate post data from the session storage', () => {
      expect(service.post).toEqual(expect.objectContaining(JSON.parse(presetPostParams)));
    });
  });

  describe('Merge with data already in the storage', () => {
    const mergedQuery = '{"qParam1":"q1","qParam2":"q2","qParam3":"true","qParam4":"false","presetQParam":"1"}';
    const mergedPost = '{"pParam1":"p1","pParam2":"p2","pParam3":"true","pParam4":"false","presetPParam":"1"}';

    const presetQueryParamsWithOverride = '{"presetQParam":"1","qParam1":"presetValue"}';
    const presetPostParamsWithOverride = '{"presetPParam":"1","pParam1":"presetValue"}';

    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
      sessionCustomStorage.setItem('_query', presetQueryParamsWithOverride);
      sessionCustomStorage.setItem('_post', presetPostParamsWithOverride);

      const getConfiguration = () => ({
        strategy: StorageStrategy.Merge,
        queryParamsValue: queryParams,
        postParamsValue: postParams,
        storage: sessionCustomStorage
      });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should merge data with session storage _query', () => {
      expect(sessionCustomStorage.getItem('_query')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_query')!)).toEqual(expect.objectContaining(JSON.parse(mergedQuery)));
    });

    it('should set query data with merged ones', () => {
      expect(service.query).toEqual(JSON.parse(mergedQuery));
    });

    it('should merge data with session storage _post', () => {
      expect(sessionCustomStorage.getItem('_post')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_post')!)).toEqual(expect.objectContaining(JSON.parse(mergedPost)));
    });

    it('should set post data with merged ones', () => {
      expect(service.post).toEqual(JSON.parse(mergedPost));
    });
  });

  describe('Replace with data already in the storage', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
      sessionCustomStorage.setItem('_query', presetQueryParams);
      sessionCustomStorage.setItem('_post', presetPostParams);

      const getConfiguration = () => ({
        strategy: StorageStrategy.Replace,
        queryParamsValue: queryParams,
        postParamsValue: postParams,
        storage: sessionCustomStorage
      });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should replace data with session storage _query', () => {
      expect(sessionCustomStorage.getItem('_query')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_query')!)).toEqual(JSON.parse(queryParams));
    });

    it('should set query data', () => {
      expect(service.query).toEqual(JSON.parse(queryParams));
    });

    it('should replace data with session storage _post', () => {
      expect(sessionCustomStorage.getItem('_post')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_post')!)).toEqual(JSON.parse(postParams));
    });

    it('should set post data', () => {
      expect(service.post).toEqual(JSON.parse(postParams));
    });
  });

  describe('Replace if not empty with data already in the storage', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
      sessionCustomStorage.setItem('_query', presetQueryParams);
      sessionCustomStorage.setItem('_post', presetPostParams);

      const getConfiguration = () => ({
        strategy: StorageStrategy.ReplaceIfNotEmpty,
        queryParamsValue: queryParams,
        postParamsValue: '{}',
        storage: sessionCustomStorage
      });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.get(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should replace data with session storage _query', () => {
      expect(sessionCustomStorage.getItem('_query')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_query')!)).toEqual(JSON.parse(queryParams));
    });

    it('should set query data', () => {
      expect(service.query).toEqual(JSON.parse(queryParams));
    });

    it('should not touch session storage _post since no parameters provided', () => {
      expect(sessionCustomStorage.getItem('_post')).toBeDefined();
      expect(JSON.parse(sessionCustomStorage.getItem('_post')!)).toEqual(JSON.parse(presetPostParams));
    });

    it('should set post data to the content of the session storage', () => {
      expect(service.post).toEqual(JSON.parse(presetPostParams));
    });
  });

  describe('Use a different storage (localCustomStorage)', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();

      const getConfiguration = () => ({
        storage: localCustomStorage,
        queryParamsValue: queryParams,
        postParamsValue: postParams
      });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should set local storage _query', () => {
      expect(localCustomStorage.getItem('_query')).toBeDefined();
      expect(sessionCustomStorage.getItem('_query')).toBeNull();
      expect(JSON.parse(localCustomStorage.getItem('_query')!)).toEqual(JSON.parse(queryParams));
    });

    it('should set property query', () => {
      expect(service.query).toEqual(JSON.parse(queryParams));
    });

    it('should set local storage _post', () => {
      expect(localCustomStorage.getItem('_post')).toBeDefined();
      expect(sessionCustomStorage.getItem('_post')).toBeNull();
      expect(JSON.parse(localCustomStorage.getItem('_post')!)).toEqual(JSON.parse(postParams));
    });

    it('should set property post', () => {
      expect(service.post).toEqual(JSON.parse(postParams));
    });
  });

  describe('Clear parameters', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();

      const getConfiguration = () => ({
        queryParamsValue: queryParams,
        postParamsValue: postParams,
        storage: sessionCustomStorage
      });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should remove only qParam1 from query parameters', () => {
      service.clearQueryParameters(['qParam1']);

      expect(JSON.parse(sessionCustomStorage.getItem('_query')!)).toEqual(expect.objectContaining({qParam2: 'q2'}));
    });

    it('should remove only pParam1 from post parameters', () => {
      service.clearPostParameters(['pParam1']);

      expect(JSON.parse(sessionCustomStorage.getItem('_post')!)).toEqual(expect.objectContaining({pParam2: 'p2'}));
    });

    it('should remove all query parameters', () => {
      service.clearQueryParameters();

      expect(JSON.parse(sessionCustomStorage.getItem('_query')!)).toEqual(JSON.parse('{}'));
    });

    it('should remove all post parameters', () => {
      service.clearPostParameters();

      expect(JSON.parse(sessionCustomStorage.getItem('_post')!)).toEqual(JSON.parse('{}'));
    });
  });

  describe('Get params', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();

      const getConfiguration = () => ({
        queryParamsValue: queryParams,
        postParamsValue: postParams,
        storage: sessionCustomStorage
      });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return all the parameters from the storage', () => {
      service.getParams();
      const qParams = JSON.parse(queryParams);
      const pParams = JSON.parse(postParams);

      expect(service.getParams()).toEqual({...qParams, ...pParams});
    });

  });

  describe('Filter parameters', () => {
    beforeEach(async () => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();

      const getConfiguration = () => ({
        queryParamsValue: queryParams,
        postParamsValue: postParams,
        storage: sessionCustomStorage
      });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.inject(RequestParametersService);
    });

    afterEach(() => {
      localCustomStorage.clear();
      sessionCustomStorage.clear();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should filter qParam1, pParam2 and pParam3 from parameters', () => {
      const filteredParams = service.getFilteredParameters(['qParam1', 'pParam2', 'pParam3']);
      const remainingParams = {qParam2: 'q2', qParam3: 'true', qParam4: 'false', pParam1: 'p1', pParam4: 'false'};

      expect(filteredParams).toEqual(remainingParams);
    });
  });

  describe('No storage available', () => {
    beforeEach(async () => {
      const getConfiguration = () => (
        {
          queryParamsValue: queryParams,
          postParamsValue: postParams
        });
      await TestBed.configureTestingModule({
        imports: [RequestParametersModule.forRoot(getConfiguration)]
      }).compileComponents();

      service = TestBed.get(RequestParametersService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
