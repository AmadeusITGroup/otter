import {
  Component,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  SandboxDirective,
} from './sandbox.directive';

@Component({
  selector: 'test-host',
  imports: [SandboxDirective],
  template: `<iframe [mfeSandbox]="sandbox"></iframe>`
})
class TestHostComponent {
  public sandbox = 'allow-scripts allow-same-origin';
}

@Component({
  selector: 'test-host-default',
  imports: [SandboxDirective],
  template: `<iframe [mfeSandbox]="''"></iframe>`
})
class TestHostDefaultComponent {}

describe('SandboxDirective', () => {
  describe('with custom sandbox value', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostComponent);
      hostComponent = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set the sandbox attribute on the iframe', () => {
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
    });

    it('should not update sandbox attribute after initialization', () => {
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      const initialSandbox = iframe.getAttribute('sandbox');

      hostComponent.sandbox = 'allow-forms';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(iframe.getAttribute('sandbox')).toBe(initialSandbox);
    });
  });

  describe('with default (empty) sandbox value', () => {
    let fixture: ComponentFixture<TestHostDefaultComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostDefaultComponent);
      fixture.detectChanges();
    });

    it('should set empty sandbox attribute (most restrictive)', () => {
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe.getAttribute('sandbox')).toBe('');
    });
  });
});
