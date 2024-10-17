import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Decorator for @Input property
 * It considers the input as an async one.
 * When a change in the input happens, it unsubscribe from the previous value
 * and subscribe to the next one
 * @param privateFieldName
 * @example
 * ```typescript
 * \@Input()
 * \@AsyncInput()
 * myStream$: Observable<number>;
 * ```
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function AsyncInput(privateFieldName?: string) {
  return (target: any, key: string) => {
    const privateSubjectField = `_subject_${privateFieldName || key}`;
    const privateStreamField = `_stream_${privateFieldName || key}`;
    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: function (this: any) {
          // Returning the same stream for reference check sake
          return this[privateStreamField];
        },
        set: function (this: any, value: Observable<any> | undefined) {
          if (value) {
            if (this[privateSubjectField]) {
              this[privateSubjectField].next(value);
            } else {
              this[privateSubjectField] = new BehaviorSubject<Observable<any>>(value);
              // Everytime the subject emits, we will discard the previous one
              // and subscribe to the new emission
              this[privateStreamField] = this[privateSubjectField].pipe(
                switchMap((stream$: Observable<any>) => stream$)
              );
            }
          } else {
            this[privateStreamField] = value;
            this[privateSubjectField] = value;
          }
        },
        enumerable: true,
        configurable: true
      });
    }
  };
}
