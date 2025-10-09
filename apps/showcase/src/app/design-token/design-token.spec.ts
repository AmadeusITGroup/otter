import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  DesignToken,
} from './design-token';

describe('DesignToken', () => {
  let component: DesignToken;
  let fixture: ComponentFixture<DesignToken>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DesignToken,
        RouterModule.forRoot([])
      ],
      providers: [provideMarkdown()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DesignToken);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
