import { Injectable } from '@angular/core';
import type { ApplicationInformationContentMessage } from '@o3r/application';
import { ReplaySubject } from 'rxjs';

export interface ExtendedApplicationInformation {
  appVersion: string;
  sessionId?: string;
  sessionGeneratedTime?: Date;
  isProduction: boolean;
  alfLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DebugPanelService {

  private applicationInformationSubject = new ReplaySubject<ExtendedApplicationInformation>(1);

  /** Application information stream */
  public applicationInformation$ = this.applicationInformationSubject.asObservable();

  /**
   * Update the application information
   *
   * @param message Message from the background service
   */
  public update(message: ApplicationInformationContentMessage) {
    this.applicationInformationSubject.next({
      appVersion: message.appVersion,
      sessionId: message.session?.id,
      sessionGeneratedTime: message.session?.generatedTime,
      isProduction: message.isProduction,
      alfLink: message.logLink
    });
  }
}
