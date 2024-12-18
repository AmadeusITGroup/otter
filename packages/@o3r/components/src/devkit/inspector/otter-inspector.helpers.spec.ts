import {
  Component,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserModule,
} from '@angular/platform-browser';
import type {
  AnalyticsEvent,
  AnalyticsEvents,
  EventInfo,
} from '@o3r/analytics';
import {
  ConfigurationObserver,
} from '@o3r/configuration';
import {
  Translation,
} from '@o3r/localization';
import {
  getAnalyticEvents,
  getConfigId,
  getOtterLikeComponentInfo,
  getTranslations,
  isContainer,
} from './otter-inspector.helpers';

class MockEvent implements AnalyticsEvent {
  public eventInfo: EventInfo = {
    eventName: 'Mock event'
  };
}

class MockSubEvent implements AnalyticsEvent {
  public eventInfo: EventInfo = {
    eventName: 'Mock sub event'
  };
}

@Component({
  selector: 'o3r-mock-component',
  template: '<o3r-mock-sub-component></o3r-mock-sub-component>',
  standalone: false
})
class MockComponent {
  public configObserver = new ConfigurationObserver('configId', {});
  public translations: Translation = {
    mainKey: 'mainKey'
  };

  public analyticsEvents: AnalyticsEvents = {
    mainEvent: MockEvent
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention -- field supposedly added by the decorator @O3rComponent
  public '__otter-info__' = {
    componentName: 'MockComponent',
    configId: 'configId',
    translations: this.translations
  };
}

@Component({
  selector: 'o3r-mock-sub-component',
  template: '',
  standalone: false
})
class MockSubComponent {
  public translations: Translation = {
    subKey: 'subKey'
  };

  public analyticsEvents: AnalyticsEvents = {
    subEvent: MockSubEvent
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention -- field supposedly added by the decorator @O3rComponent
  public '__otter-info__' = {
    componentName: 'MockSubComponent',
    translations: this.translations
  };
}

describe('Otter inspector helpers', () => {
  describe('isContainer', () => {
    it('should return true if the node is an Otter container', () => {
      const node = document.createElement('o3r-component-cont');

      expect(isContainer(node)).toBe(true);
    });

    it('should return false if the node is not an Otter container', () => {
      const node = document.createElement('div');

      expect(isContainer(node)).toBe(false);
    });
  });

  describe('getConfigId', () => {
    it('should return the config id of the component instance', () => {
      const instance = {
        '__otter-info__': {
          configId: 'configId'
        }
      };

      expect(getConfigId(instance)).toBe('configId');
    });

    it('should return undefined if the component instance has no config id', () => {
      const instance = {};

      expect(getConfigId(instance)).toBeUndefined();
    });
  });

  describe('helpers that need a component instance', () => {
    let component: ComponentFixture<MockComponent>;
    beforeAll(async () => {
      await TestBed.configureTestingModule({
        declarations: [MockComponent, MockSubComponent],
        imports: [BrowserModule]
      }).compileComponents();

      component = TestBed.createComponent(MockComponent);
    });

    describe('getTranslations', () => {
      it('should return the translations of the node', () => {
        const translations = getTranslations(component.elementRef.nativeElement);

        expect(Object.keys(translations)).toContain('MockComponent');
        expect(Object.keys(translations)).toContain('MockSubComponent');
        expect(translations.MockComponent).toContain('mainKey');
        expect(translations.MockSubComponent).toContain('subKey');
      });
    });

    describe('getAnalyticsEvents', () => {
      it('should return the analytics events of the node', () => {
        const events = getAnalyticEvents(component.elementRef.nativeElement);

        expect(Object.keys(events)).toContain('MockComponent');
        expect(Object.keys(events)).toContain('MockSubComponent');
        expect(events.MockComponent).toContain('MockEvent');
        expect(events.MockSubComponent).toContain('MockSubEvent');
      });
    });

    describe('getOtterLikeComponentInfo', () => {
      it('should return the info of the component', () => {
        const info = getOtterLikeComponentInfo(component.componentInstance, component.elementRef.nativeElement);

        expect(info.configId).toBe('configId');
        expect(info.componentName).toBe('MockComponent');
        expect(Object.keys(info.translations)).toContain('MockComponent');
        expect(Object.keys(info.translations)).toContain('MockSubComponent');
        expect(Object.keys(info.analytics)).toContain('MockComponent');
        expect(Object.keys(info.analytics)).toContain('MockSubComponent');
      });
    });
  });
});
