import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  Home,
} from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideMarkdown(),
        provideDynamicContent()
      ]
    });
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
