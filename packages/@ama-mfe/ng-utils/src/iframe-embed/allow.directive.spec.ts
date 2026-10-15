import {
  Component,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  AllowDirective,
} from './allow.directive';

@Component({
  selector: 'test-host',
  imports: [AllowDirective],
  template: `<iframe [mfeAllow]="allow"></iframe>`
})
class TestHostComponent {
  public allow = 'camera; microphone';
}

@Component({
  selector: 'test-host-default',
  imports: [AllowDirective],
  template: `<iframe [mfeAllow]="''"></iframe>`
})
class TestHostDefaultComponent {}

describe('AllowDirective', () => {
  describe('with custom allow value', () => {
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

    it('should set the allow attribute on the iframe', () => {
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe.getAttribute('allow')).toBe('camera; microphone');
    });

    it('should not update allow attribute after initialization', () => {
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      const initialAllow = iframe.getAttribute('allow');

      hostComponent.allow = 'fullscreen';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(iframe.getAttribute('allow')).toBe(initialAllow);
    });
  });

  describe('with default (empty) allow value', () => {
    let fixture: ComponentFixture<TestHostDefaultComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostDefaultComponent);
      fixture.detectChanges();
    });

    it('should not set the allow attribute', () => {
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe.hasAttribute('allow')).toBe(false);
    });
  });
});
