import { Injectable } from '@angular/core';
import { FactDefinitions, FactsService, RulesEngineService } from '@o3r/rules-engine';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

/** Facts for a trip */
export interface TripFacts extends FactDefinitions {
  /** Trip destination */
  destination: string | null;
  /** Trip outbound date */
  outboundDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TripFactsService extends FactsService<TripFacts> {
  private destination$ = new BehaviorSubject<string | null>(null);
  private outboundDate$ = new BehaviorSubject<string | null>(null);

  /** @inheritdoc */
  public facts = {
    destination: this.destination$.asObservable().pipe(distinctUntilChanged()),
    outboundDate: this.outboundDate$.asObservable().pipe(distinctUntilChanged())
  };

  constructor(rulesEngine: RulesEngineService) {
    super(rulesEngine);
  }

  /**
   * Update the destination
   *
   * @param destination
   */
  public updateDestination(destination: string | null) {
    this.destination$.next(destination);
  }

  /**
   * Update the outbound date
   *
   * @param outboundDate
   */
  public updateOutboundDate(outboundDate: string | null) {
    this.outboundDate$.next(outboundDate);
  }
}

