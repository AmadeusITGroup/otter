import { TestScheduler } from 'rxjs/testing';
import { lazyArray } from './rendering.helpers';

/* eslint-disable space-in-parens */
describe('Rendering helpers', () => {
  let testScheduler: TestScheduler;

  describe('lazyArray', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) =>

        expect(actual).toEqual(expected)
      );
    });


    it('should not emit elements if empty', () => {
      testScheduler.run((helpers) => {
        const {expectObservable, cold } = helpers;

        const stream = cold('-a', { a: [] });

        expectObservable(
          stream.pipe(
            lazyArray()
          )
        ).toBe('-');
      });
    });

    it('should emit only 1 element', () => {
      testScheduler.run((helpers) => {
        const {expectObservable, cold, animate } = helpers;
        animate(' -x-x-x ');
        const val = [1];
        const stream = cold('-a', { a: val });

        expectObservable(
          stream.pipe(
            lazyArray()
          )
        ).toBe('^--(a)', { a: val });
      });
    });

    it('should emit default amount of elements', () => {
      testScheduler.run((helpers) => {
        const {expectObservable, cold, animate } = helpers;

        animate('            ---x--x--x--x--x ');
        const stream = cold('-a--------------', { a: [1, 2, 3, 4]});

        expectObservable(stream.pipe(lazyArray())
        ).toBe('             ---a--b', { a: [1, 2], b: [1, 2 ,3, 4]});
      });
    });


    it('should support change amount of emitted elements and delay', () => {
      testScheduler.run((helpers) => {
        const {expectObservable, cold, animate, time } = helpers;

        const delay = time('            -| ');
        animate('            --x---x----x---x----x ');
        const stream = cold('--a', { a: [1, 2, 3, 4]});
        const elementsAtOnce = 3;

        expectObservable(
          stream.pipe(
            lazyArray(delay, elementsAtOnce)
          )
        ).toBe('             ------a-----b', { a: [1, 2, 3], b: [1, 2, 3 ,4]});
      });
    });
  });
});
