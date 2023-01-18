import {getTestBed, TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {<%= serviceName %>} from './<%= name %>.<%= featureName %>.service';

let service: <%= serviceName %>;

describe('<%= serviceName %>', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        <%= serviceName %>
      ]
    });

    service = TestBed.inject(<%= serviceName %>);
  });


  it('should compile', () => {
    expect(true).toBe(true);
    expect(service).toBeDefined();
    expect(service instanceof <%= serviceName %>).toBe(true);
  });
});
