import {
  Directive,
  Injectable,
  NgModule,
  Provider,
} from '@angular/core';
import {
  Observable,
} from 'rxjs';
import {
  mapTo,
} from 'rxjs/operators';
import {
  C11nService,
} from './c11n-service';

/** C11n directive mock */
@Directive({
  selector: '[c11n]',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property -- mocked directive
  inputs: ['config', 'component', 'inputs', 'outputs'],
  standalone: false
})
export class MockC11nDirective {}

/** C11n service mock */
@Injectable()
export class C11nMockService {
  public addPresenter(_presKey: string, _presType: any) {}
  public getPresenter(_defaultPres: any, _presKey: string) {
    return (source: Observable<any>) => source.pipe(mapTo(null));
  }
}

/**
 * The purpose of this module is to be imported in the unit tests of the components which are using c11n directive
 * @deprecated Will be removed in v16. Use {@link provideC11nMock} and import `MockC11nDirective` directly instead.
 */
@NgModule({
  declarations: [MockC11nDirective],
  exports: [MockC11nDirective],
  providers: [{ provide: C11nService, useClass: C11nMockService }]
})
export class C11nMockModule {}

/**
 * Provide C11n mock service for testing.
 */
export function provideC11nMock(): Provider[] {
  return [
    { provide: C11nService, useClass: C11nMockService }
  ];
}
