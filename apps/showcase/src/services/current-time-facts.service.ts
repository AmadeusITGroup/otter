import { Injectable } from '@angular/core';
import { CurrentTimeFacts, FactsService, RulesEngineRunnerService } from '@o3r/rules-engine';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentTimeFactsService extends FactsService<CurrentTimeFacts> {

  private readonly currentTimeSubject$ = new BehaviorSubject(new Date('2023-11-2').getTime());
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
