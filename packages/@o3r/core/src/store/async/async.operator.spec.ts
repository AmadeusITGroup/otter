import { lastValueFrom, of, Subject } from 'rxjs';
import { fromApiEffectSwitchMapById } from './async.operators';

/**
 * @param delay
 */
function later(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
}

/**
 * @param id
 * @param delay
 * @param name
 * @param requestId
 */
function createAction(
  id: string,
  delay: number,
  name: string,
  requestId: string
) {
  return {id, call: later(delay), name, requestId};
}

describe('AsyncOperator', () => {
  it('fromApiEffectSwitchMapById', () => {
    const actionsStream = new Subject<any>();
    const outputs: any[] = [];
    actionsStream
      .pipe(
        fromApiEffectSwitchMapById(
          (reply, action) => {
            return {type: 'success', reply, action};
          },
          (error, action) => of({type: 'error', error, action}),
          (props, action) => {
            return {props, action, type: 'cancelRequestId'};
          }
        )
      )
      .subscribe((output) => {
        outputs.push(output);
        if (outputs.length === 6) {
          // id1, id2 should be canceled for placeholder 1
          // id4, id5 should be canceled for placeholder 1
          expect(outputs[0].type).toBe('cancelRequestId');
          expect(outputs[0].props.requestId).toBe('id1');
          expect(outputs[1].type).toBe('cancelRequestId');
          expect(outputs[1].props.requestId).toBe('id4');
          expect(outputs[2].type).toBe('cancelRequestId');
          expect(outputs[2].props.requestId).toBe('id2');
          expect(outputs[3].type).toBe('cancelRequestId');
          expect(outputs[3].props.requestId).toBe('id5');

          // id3 success for placeholder 1
          // id6 success for placeholder
          expect(outputs[4].type).toBe('success');
          expect(outputs[4].action.requestId).toBe('id3');
          expect(outputs[5].type).toBe('success');
          expect(outputs[5].action.requestId).toBe('id6');
          actionsStream.complete();
        }
      });
    actionsStream.next(createAction('1', 1500, 'Action1Template1', 'id1'));

    setTimeout(
      () => actionsStream.next(createAction('1', 800, 'Action2Template1', 'id2')),
      200
    );
    setTimeout(
      () => actionsStream.next(createAction('1', 2000, 'Action3Template1', 'id3')),
      400
    );

    actionsStream.next(createAction('2', 1500, 'Action1Template2', 'id4'));
    setTimeout(
      () => actionsStream.next(createAction('2', 800, 'Action2Template2', 'id5')),
      200
    );
    setTimeout(
      () => actionsStream.next(createAction('2', 2000, 'Action3Template2', 'id6')),
      400
    );

    return lastValueFrom(actionsStream);
  });
});
