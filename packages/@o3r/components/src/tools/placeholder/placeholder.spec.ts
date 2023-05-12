import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Subject} from 'rxjs';
import {PlaceholderComponent} from './placeholder.component';

/**
 * Test component to check if the projection from ng-content works
 */
@Component({
  selector: 'test-placeholder',
  template: `
    <o3r-placeholder>
      <span>Loading...</span>
    </o3r-placeholder>
  `
})
class TestComponent {
}

describe('Placeholder component', () => {
  beforeAll(
    () => getTestBed().platform ||
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: {destroyAfterEach: false}
      }));

  let placeholderComponent: ComponentFixture<PlaceholderComponent>;
  type TemplatesFromStore = { orderedRenderedTemplates: (string | undefined)[]; isPending: boolean };
  let storeContent: Subject<TemplatesFromStore>;
  let mockStore: {
    dispatch: jest.Mock;
    pipe: jest.Mock;
    select: jest.Mock;
  };
  beforeEach(async () => {
    storeContent = new BehaviorSubject<TemplatesFromStore>({orderedRenderedTemplates: [''], isPending: false});
    mockStore = {
      dispatch: jest.fn(),
      pipe: jest.fn().mockReturnValue(storeContent),
      select: jest.fn().mockReturnValue(storeContent)
    };
    await TestBed.configureTestingModule({
      imports: [
        CommonModule
      ],
      providers: [
        {provide: Store, useValue: mockStore}
      ],
      declarations: [
        PlaceholderComponent,
        TestComponent
      ]
    }).compileComponents();
  });

  it('should render the template', () => {
    placeholderComponent = TestBed.createComponent(PlaceholderComponent);

    storeContent.next({
      orderedRenderedTemplates: ['<div>test template</div>'],
      isPending: false
    });

    placeholderComponent.componentInstance.id = 'testPlaceholder';
    placeholderComponent.detectChanges();

    expect(placeholderComponent.nativeElement.children[0].tagName).toBe('DIV');
    expect(placeholderComponent.nativeElement.children[0].innerHTML).toEqual('<div>test template</div>');
  });

  it('should render the templates', () => {
    placeholderComponent = TestBed.createComponent(PlaceholderComponent);

    storeContent.next({
      orderedRenderedTemplates: ['<div>test template</div>', '<div>test template 2</div>'],
      isPending: false
    });

    placeholderComponent.componentInstance.id = 'testPlaceholder';
    placeholderComponent.detectChanges();

    expect(placeholderComponent.nativeElement.children[0].tagName).toBe('DIV');
    expect(placeholderComponent.nativeElement.children[0].innerHTML).toEqual('<div>test template</div><div>test template 2</div>');
  });

  it('should retrieve new template on ID change', () => {
    placeholderComponent = TestBed.createComponent(PlaceholderComponent);
    placeholderComponent.componentInstance.id = 'testPlaceholder';
    placeholderComponent.detectChanges();
    placeholderComponent.componentInstance.id = 'testPlaceholder2';
    placeholderComponent.detectChanges();
    placeholderComponent.componentInstance.id = 'testPlaceholder2';
    placeholderComponent.detectChanges(true);

    expect(mockStore.select).toHaveBeenCalledTimes(2);
  });

  it('isPending status of the placeholder should display the ng-content', () => {
    const testComponentFixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    const contentDisplayed = testComponentFixture.debugElement.query(By.css('o3r-placeholder'));
    contentDisplayed.componentInstance.id = 'placeholder1';

    // Ensure that the default isPending is set to undefined
    testComponentFixture.debugElement.query(By.css('o3r-placeholder')).componentInstance.isPending = undefined;
    testComponentFixture.detectChanges();

    expect(contentDisplayed.query(By.css('span'))).toBe(null);

    // Simulate a call to an url to retrieve a placeholder, Loading... should be displayed
    storeContent.next({orderedRenderedTemplates: [''], isPending: true});
    testComponentFixture.detectChanges();

    expect(contentDisplayed.query(By.css('span')).nativeElement.innerHTML).toBe('Loading...');

    // Simulate the result from the call, setting isPending to false, renderedTemplate should be displayed
    storeContent.next({orderedRenderedTemplates: ['This is the rendered template'], isPending: false});
    testComponentFixture.detectChanges();

    expect(contentDisplayed.query(By.css('div')).nativeElement.innerHTML).toBe('This is the rendered template');
  });
});
