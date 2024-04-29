import { inject, Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contact, type ContactWithoutId } from './contact';
import { URL } from './config';
import { lastValueFrom, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllContact, selectContactStorePendingStatus } from './store/contact/contact.selectors';
import { setContactEntitiesFromApi } from './store/contact/contact.actions';

interface ContactResponse {
  data: Contact[];
  next: number | undefined;
  prev: number | undefined;
}


@Injectable({
  providedIn: 'root'
})
export class BackEndService {
  /// Tanstack query usage
  private readonly http = inject(HttpClient);
  public currentId = signal('1');
  public filter = signal('');
  public currentStart = signal(0);
  public currentLimit = signal(5);
  public currentPage = signal(1);

  // store solution
  public readonly store = inject(Store);

  public allContact = this.store.select(selectAllContact);

  public isPending = this.store.select(selectContactStorePendingStatus);

  public isFailing = this.store.select(selectContactStorePendingStatus);

  constructor() {
    // store solution
    this.store.dispatch(setContactEntitiesFromApi({call: lastValueFrom(this.http.get<Contact[]>(`${URL}?q=`))}));
  }

  public saveFn(contact: ContactWithoutId) {
    if (contact.id) {
      return this.http.put<Contact>(`${URL}/${contact.id}`, contact);
    }
    return this.http.post<Contact>(`${URL}`, contact);
  }

  public removeFn(id: string) {
    return this.http.delete<Contact>(`${URL}/${id}`);
  }

  public getInfiniteContacts(pageParam: number) {
    return this.http.get<ContactResponse>(`${URL}?_page=${pageParam.toString()}&_per_page=${this.currentLimit().toString()}`).pipe(tap(() => this.currentPage.set(pageParam)));
  }
}
