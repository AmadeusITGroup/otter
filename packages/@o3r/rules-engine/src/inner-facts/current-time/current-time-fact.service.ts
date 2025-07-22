import {
  Injectable,
} from '@angular/core';
import {
  BehaviorSubject,
} from 'rxjs';
import {
  FactsService,
} from '../../fact';
import {
  RulesEngineRunnerService,
} from '../../services';
import {
  CurrentTimeFacts,
} from './current-time.facts';

@Injectable({
  providedIn: 'root'
})
export class CurrentTimeFactsService extends FactsService<CurrentTimeFacts> {
  private readonly currentTimeSubject$ = new BehaviorSubject(Date.now());
  /** @inheritDoc */
  public facts = {
    o3rCurrentTime: this.currentTimeSubject$.asObservable()
  };

  constructor(rulesEngine: RulesEngineRunnerService) {
    super(rulesEngine);
  }

  /** Compute the current time */
  public tick() {
    this.currentTimeSubject$.next(Date.now());
  }
}
