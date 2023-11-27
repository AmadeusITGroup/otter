import { BehaviorSubject } from 'rxjs';

/**
 * Behaviour subject with the current time as the initial value
 */
export const currentTimeSubject$ = new BehaviorSubject(Date.now());
