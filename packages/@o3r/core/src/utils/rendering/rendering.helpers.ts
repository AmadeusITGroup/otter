import { animationFrameScheduler, from, Observable, observeOn, of } from 'rxjs';
import {
  bufferCount,
  concatMap,
  delay,
  mergeMap,
  scan,
  tap
} from 'rxjs/operators';

/**
 * Buffers and emits data for lazy/progressive rendering of big lists
 * That could solve issues with long-running tasks when trying to render an array
 * of similar components.
 *
 * @param delayMs Delay between data emits
 * @param concurrency Amount of elements that should be emitted at once
 * @returns
 */
export function lazyArray<T>(delayMs = 0, concurrency = 2) {
  let isFirstEmission = true;
  return (source$: Observable<T[]>) => {
    return source$.pipe(
      mergeMap((items) => {
        if (!isFirstEmission) {
          return of(items);
        }

        const items$ = from(items);

        return items$.pipe(
          bufferCount(concurrency),
          concatMap((value, index) => {
            return of(value).pipe(
              observeOn(animationFrameScheduler),
              delay(index * delayMs)
            );
          }),
          scan((acc: T[], steps: T[]) => {
            return [...acc, ...steps];
          }, []),
          tap((scannedItems: T[]) => {
            const scanDidComplete = scannedItems.length === items.length;

            if (scanDidComplete) {
              isFirstEmission = false;
            }
          })
        );
      })
    );
  };
}
