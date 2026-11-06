import {
  Component,
  input,
} from '@angular/core';
import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  provideStore,
  Store,
  StoreModule,
} from '@ngrx/store';
import {
  firstValueFrom,
} from 'rxjs';
import {
  ConfigurationBaseServiceModule,
} from '../../services/configuration/configuration-base-module';
import {
  ConfigurationBaseService,
} from '../../services/configuration/configuration-base-service';
import {
  configSignal,
} from '../../tools/configuration-signal';
import {
  provideConfigOverrideStore,
} from '../config-override/config-override-module';
import {
  ConfigurationStoreModule,
  provideConfigurationStore,
} from './configuration-module';
import {
  configurationReducer,
} from './configuration.reducer';
import {
  selectConfigurationEntities,
} from './configuration.selectors';

@Component({ template: '' })
class ConfigurableTestComponent {
  public readonly config = input<{ enabled?: boolean }>();
  public readonly configSignal = configSignal(this.config, 'test-config', { enabled: true });
}

describe('Configuration store providers', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting()));

  it('registers the service and synchronizes component configuration', async () => {
    TestBed.configureTestingModule({
      imports: [ConfigurableTestComponent],
      providers: [provideStore(), provideConfigOverrideStore(), provideConfigurationStore()]
    });

    const fixture = TestBed.createComponent(ConfigurableTestComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const entities = await firstValueFrom(TestBed.inject(Store).select(selectConfigurationEntities));
    expect(entities['test-config']).toEqual({ id: 'test-config', enabled: true });

    TestBed.inject(ConfigurationBaseService).upsertConfiguration({ enabled: false }, 'test-config');
    await fixture.whenStable();
    expect(fixture.componentInstance.configSignal().enabled).toBe(false);
  });

  it('continues to provide the service through the legacy module', () => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), ConfigurationBaseServiceModule]
    });

    expect(TestBed.inject(ConfigurationBaseService)).toBeInstanceOf(ConfigurationBaseService);
  });

  it('does not add the service to the legacy store module', () => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), ConfigurationStoreModule]
    });

    expect(TestBed.inject(ConfigurationBaseService, null)).toBeNull();
  });

  it('uses the supplied reducer with the service', async () => {
    const reducer = jest.fn(configurationReducer);
    TestBed.configureTestingModule({
      providers: [provideStore(), provideConfigurationStore(() => reducer)]
    });

    TestBed.inject(ConfigurationBaseService).upsertConfiguration({ enabled: false }, 'custom-config');
    const entities = await firstValueFrom(TestBed.inject(Store).select(selectConfigurationEntities));
    expect(reducer).toHaveBeenCalled();
    expect(entities['custom-config']).toEqual({ id: 'custom-config', enabled: false });
  });

  it('keeps the service optional when the configuration store is not provided', () => {
    TestBed.configureTestingModule({
      imports: [ConfigurableTestComponent],
      providers: [provideStore()]
    });

    expect(TestBed.inject(ConfigurationBaseService, null)).toBeNull();
    const fixture = TestBed.createComponent(ConfigurableTestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.configSignal()).toEqual({ enabled: true });
  });
});
