import {
  Component,
  Directive,
  input,
  Pipe,
  type PipeTransform,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DomSanitizer,
} from '@angular/platform-browser';
import type {
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  IframeEmbedComponent,
} from './iframe-embed.component';

@Directive({
  selector: '[connect]',
  standalone: true
})
class MockConnectDirective {
  public readonly connect = input.required<string>();
}

@Directive({
  selector: '[scalable]',
  standalone: true
})
class MockScalableDirective {}

@Directive({
  selector: 'iframe[mfeSandbox]',
  standalone: true
})
class MockSandboxDirective {
  public readonly mfeSandbox = input('');
}

@Pipe({
  name: 'hostInfo',
  standalone: true
})
class MockHostInfoPipe implements PipeTransform {
  public transform(value: unknown) {
    return value;
  }
}

@Pipe({
  name: 'applyTheme',
  standalone: true
})
class MockApplyTheme implements PipeTransform {
  public transform(value: unknown) {
    return value;
  }
}

describe('IframeEmbedComponent', () => {
  let component: IframeEmbedComponent;
  let domSanitizer: DomSanitizer;

  /**
   * Host wrapper to set required signal inputs via property bindings.
   */
  @Component({
    selector: 'test-host',
    imports: [IframeEmbedComponent],
    template: `
      <mfe-iframe-embed
        [src]="src"
        [moduleId]="moduleId"
        [hostApplicationId]="hostApplicationId" />
    `
  })
  class TestHostComponent {
    public src: string | SafeResourceUrl = 'https://example.com';
    public moduleId = 'test-module';
    public hostApplicationId = 'test-host-app';
  }

  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent
      ]
    }).overrideComponent(IframeEmbedComponent, {
      set: {
        imports: [MockConnectDirective, MockScalableDirective, MockHostInfoPipe, MockApplyTheme, MockSandboxDirective]
      }
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    domSanitizer = TestBed.inject(DomSanitizer);

    hostFixture.detectChanges();

    const embeddedDebugEl = hostFixture.debugElement.children[0];
    component = embeddedDebugEl.componentInstance as IframeEmbedComponent;
  });

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeDefined();
      expect(component).toBeInstanceOf(IframeEmbedComponent);
    });
  });

  describe('safeSrc computed', () => {
    it('should sanitize a plain string input', () => {
      const bypassSpy = jest.spyOn(domSanitizer, 'bypassSecurityTrustResourceUrl');
      hostComponent.src = 'https://test-url.com/page';
      hostFixture.changeDetectorRef.markForCheck();
      hostFixture.detectChanges();

      const result = component.safeSrc();

      expect(bypassSpy).toHaveBeenCalledWith('https://test-url.com/page');
      expect(result).toBeDefined();
    });

    it('should pass through a pre-sanitized SafeResourceUrl', () => {
      const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://pre-sanitized.com');
      const bypassSpy = jest.spyOn(domSanitizer, 'bypassSecurityTrustResourceUrl');

      hostComponent.src = safeUrl;
      hostFixture.changeDetectorRef.markForCheck();
      hostFixture.detectChanges();

      const result = component.safeSrc();

      expect(bypassSpy).not.toHaveBeenCalled();
      expect(result).toBe(safeUrl);
    });
  });

  describe('inputs', () => {
    it('should expose the moduleId input', () => {
      hostComponent.moduleId = 'my-module';
      hostFixture.changeDetectorRef.markForCheck();
      hostFixture.detectChanges();

      expect(component.moduleId()).toBe('my-module');
    });

    it('should expose the hostApplicationId input', () => {
      hostComponent.hostApplicationId = 'my-host-app';
      hostFixture.changeDetectorRef.markForCheck();
      hostFixture.detectChanges();

      expect(component.hostApplicationId()).toBe('my-host-app');
    });
  });

  describe('template rendering', () => {
    it('should render an iframe element', () => {
      const iframe = hostFixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe).toBeTruthy();
    });

    it('should have the default sandbox attribute', () => {
      expect(component.sandbox()).toBe('allow-scripts allow-same-origin');
    });

    it('should apply the scalable directive', () => {
      const iframe = hostFixture.debugElement.nativeElement.querySelector('iframe[scalable]') as HTMLIFrameElement;
      expect(iframe).toBeTruthy();
    });
  });
});
