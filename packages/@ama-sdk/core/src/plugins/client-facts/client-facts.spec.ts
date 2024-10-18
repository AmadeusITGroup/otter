import {
  RequestOptions
} from '../core';
import {
  ClientFactsRequestPlugin,
  createJwtFactsEncoder,
  PublicFacts
} from './client-facts.request';

const defaultFacts: PublicFacts = {
  foo: 'one',
  bar: 'two'
};

const specificFacts: PublicFacts = {
  bar: 'three',
  specific: 'I am specific'
};

const encryptedPrivateFacts = 'GuTVpr8JxjTj1Umlmph5h5sP00c2RfIUjJIw5iYMHarSXA8sYUIuEKTUDdC5fVkcmKXi4qd3W5y/VGQcKCo0bba3JlfBGviegpGVRvug/vfH2VYTsUyAyBFdcG+CiI4dY+0/Nn48G656KxRygBkxmg==';

const jwtFactsEncoder = createJwtFactsEncoder();

const defaultHeader = 'ama-client-facts';

describe('Client Facts request plugin', () => {
  let options: RequestOptions;
  let specificOptions: RequestOptions;

  beforeEach(() => {
    options = {
      basePath: 'dummypath',
      headers: new Headers(),
      method: 'GET'
    };

    specificOptions = {
      basePath: '/order',
      headers: new Headers(),
      method: 'POST'
    };
  });

  it('Should encode the public facts as unsecured JWT', () => {
    expect((jwtFactsEncoder(defaultFacts))).toEqual('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmYWN0IiwiZm9vIjoib25lIiwiYmFyIjoidHdvIn0.');
  });

  it('Should apply global facts to every requests to the default header', async () => {
    const plugin = new ClientFactsRequestPlugin({
      initialGlobalFacts: defaultFacts
    });

    const firstOptions = await plugin.load().transform(options);

    expect(firstOptions.headers.has(defaultHeader)).toBeTruthy();
    expect(firstOptions.headers.get(defaultHeader)).toEqual(jwtFactsEncoder(defaultFacts));

    options.headers = new Headers();
    const secondOptions = await plugin.load().transform(options);

    expect(secondOptions.headers.has(defaultHeader)).toBeTruthy();
    expect(secondOptions.headers.get(defaultHeader)).toEqual(jwtFactsEncoder(defaultFacts));
  });

  it('Should allow to configure header name', async () => {
    const plugin = new ClientFactsRequestPlugin({
      initialGlobalFacts: defaultFacts,
      headerName: 'dummy'
    });

    const newOptions = await plugin.load().transform(options);

    expect(newOptions.headers.has('dummy')).toBeTruthy();
    expect(newOptions.headers.has(defaultHeader)).toBeFalsy();
  });

  it('Should allow to change facts via a function', async () => {
    const plugin = new ClientFactsRequestPlugin({
      initialGlobalFacts: defaultFacts
    });

    plugin.setGlobalFacts({ foo: 'bar' });

    const newOptions = await plugin.load().transform(options);

    expect(newOptions.headers.has(defaultHeader)).toBeTruthy();
    expect(newOptions.headers.get(defaultHeader)).toEqual(jwtFactsEncoder({ foo: 'bar' }));
  });

  it('Should allow to return facts only for specific requests thanks to factories', async () => {
    const plugin = new ClientFactsRequestPlugin({
      factsFactory: (request) => {
        if (request.basePath.includes('/order') && request.method !== 'GET') {
          return specificFacts;
        }
        return {};
      }
    });

    const newOptions = await plugin.load().transform(options);

    expect(newOptions.headers.has(defaultHeader)).toBeFalsy();

    const newSpecificOptions = await plugin.load().transform(specificOptions);

    expect(newSpecificOptions.headers.has(defaultHeader)).toBeTruthy();
    expect(newSpecificOptions.headers.get(defaultHeader)).toEqual(jwtFactsEncoder(specificFacts));
  });

  it('Should allow to set private facts', async () => {
    const plugin = new ClientFactsRequestPlugin({
      privateFacts: encryptedPrivateFacts
    });

    const newOptions = await plugin.load().transform(options);

    expect(newOptions.headers.has(defaultHeader)).toBeTruthy();
    expect(newOptions.headers.get(defaultHeader)).toEqual(encryptedPrivateFacts);
  });

  it('Specific facts should have priority over global facts', async () => {
    const plugin = new ClientFactsRequestPlugin({
      initialGlobalFacts: defaultFacts,
      factsFactory: (request) => {
        if (request.basePath.includes('/order') && request.method !== 'GET') {
          return specificFacts;
        }
        return {};
      }
    });

    const newSpecificOptions = await plugin.load().transform(specificOptions);

    expect(newSpecificOptions.headers.has(defaultHeader)).toBeTruthy();
    expect(newSpecificOptions.headers.get(defaultHeader)).toEqual(jwtFactsEncoder({ ...defaultFacts, ...specificFacts }));
  });

  it('Factories should be allowed to be asynchronous and return a Promise of facts', async () => {
    const plugin = new ClientFactsRequestPlugin({
      factsFactory: (request) => {
        if (request.basePath.includes('/order') && request.method !== 'GET') {
          return new Promise((resolve) => setTimeout(() => resolve(specificFacts), 500));
        }
        return {};
      }
    });

    const promise = plugin.load().transform(specificOptions);
    await jest.runAllTimersAsync();
    const newSpecificOptions = await promise;

    expect(newSpecificOptions.headers.has(defaultHeader)).toBeTruthy();
    expect(newSpecificOptions.headers.get(defaultHeader)).toEqual(jwtFactsEncoder(specificFacts));
  });
});
