import {
  Component,
  input,
} from '@angular/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  configSignal,
  ConfigurationDevtoolsMessageService,
  O3rConfig,
} from '@o3r/configuration';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  CONFIGURATION_PRES_CONFIG_ID,
  CONFIGURATION_PRES_DEFAULT_CONFIG,
  ConfigurationPresConfig,
} from '../components/showcase/configuration/configuration-pres-config';

jest.mock('@angular/common/locales/en', () => ({ __esModule: true, default: ['en'] }));
jest.mock('@angular/common/locales/fr', () => ({ __esModule: true, default: ['fr'] }));
jest.mock('@o3r/application', () => ({
  ...jest.requireActual<typeof import('@o3r/application')>('@o3r/application'),
  prefersReducedMotion: () => false
}));

@Component({ template: '' })
class TestConfigurableComponent {
  public readonly config = input<Partial<ConfigurationPresConfig>>();
  @O3rConfig()
  public configSignal = configSignal(this.config, CONFIGURATION_PRES_CONFIG_ID, CONFIGURATION_PRES_DEFAULT_CONFIG);
}

describe('Showcase configuration devtools', () => {
  it('publishes component defaults and applies configuration updates', async () => {
    const { appConfig } = await import('./app.config');
    TestBed.configureTestingModule({
      imports: [TestConfigurableComponent],
      providers: [
        ...appConfig.providers,
        provideLocalizationMock({ language: 'en' }, { en: {} })
      ]
    });

    const postMessage = jest.spyOn(globalThis.window, 'postMessage');
    TestBed.inject(ConfigurationDevtoolsMessageService);
    const fixture = TestBed.createComponent(TestConfigurableComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    postMessage.mockClear();

    globalThis.window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'otter', to: 'app', content: { dataType: 'requestMessages', only: ['configurations'] } }
    }));
    await fixture.whenStable();

    expect(postMessage).toHaveBeenCalledWith(expect.stringContaining(
      `"${CONFIGURATION_PRES_CONFIG_ID}":{"id":"${CONFIGURATION_PRES_CONFIG_ID}","inXDays":7`
    ), '*');
    expect(postMessage).toHaveBeenCalledWith(expect.stringContaining('"dataType":"configurations"'), '*');

    globalThis.window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'otter', to: 'app', content: { dataType: 'updateConfig', id: CONFIGURATION_PRES_CONFIG_ID, configValue: { inXDays: 12 } } }
    }));
    await fixture.whenStable();
    expect(fixture.componentInstance.configSignal().inXDays).toBe(12);
    postMessage.mockRestore();
  });
});
