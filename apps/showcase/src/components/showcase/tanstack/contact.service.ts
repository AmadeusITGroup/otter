// import { inject, Injectable, OnDestroy } from '@angular/core';
// import { BackEndService } from './backend.service';
// import { BehaviorSubject, Subject, Subscription } from 'rxjs';
// import { map, shareReplay, switchMap } from 'rxjs/operators';
// import { filterSuccess } from '@ngneat/query';

// @Injectable({
//   providedIn: 'root'
// })
// export class ContactService implements OnDestroy {
//   // private state
//   private _subscription = new Subscription();
//   private _filter$ = new BehaviorSubject('');
//   private backend = inject(BackEndService);
//   private _contactId$ = new Subject<string>();

//   // public readable API
//   filter$ = this._filter$.asObservable();
//   contactId$ = this._contactId$.asObservable();
//   filteredContacts$ = this._filter$.pipe(
//     switchMap((filter) => {
//       return this.backend.getContacts$(filter).result$.pipe(
//         filterSuccess(),
//         map((project) => project.data)
//       );
//     })
//   );
//   contactsCount$ = this.filteredContacts$.pipe(map((data) => data.length));
//   saveMutation = this.backend.createMutationSaveContact();
//   saveMutationResult$ = this.saveMutation.result$.pipe(shareReplay(1));
//   removeMutation = this.backend.createMutationRemoveContact();
//   removeMutationResult$ = this.removeMutation.result$.pipe(shareReplay(1));

//   getContact$(id: string) {
//     return this.backend.getContact$(id);
//   }

//   getFilter$Value() {
//     return this._filter$.value;
//   }

//   // public writable API
//   // remove(id: string) {
//   //   // TODO We can display an error if it fail ?
//   //   this.removeMutation.mutate(id);
//   // }
//   // save(contact: Contact) {
//   //   this.saveMutation.mutate(contact);
//   // }

//   filter(text: string) {
//     this._filter$.next(text);
//   }

//   ngOnDestroy(): void {
//     this._subscription.unsubscribe();
//   }
// }
