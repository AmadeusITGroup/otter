import { computed, effect, inject, Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contact } from './contact';
import { URL } from './config';
import { injectInfiniteQuery, injectMutation, injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom, tap } from 'rxjs';
// eslint-disable-next-line camelcase
import { experimental_createPersister } from '@tanstack/query-persist-client-core';

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
  public queryClient = injectQueryClient();
  public currentId = signal('1');
  public filter = signal('');
  public currentStart = signal(0);
  public currentLimit = signal(5);
  public currentPage = signal(1);

  public contact = injectQuery(() => ({
    queryKey: ['contact', this.currentId()],
    queryFn: () => {
      // console.log('in getContact$ with id', id);
      return lastValueFrom(this.http.get<Contact>(`${URL}/${this.currentId()}`));
    },
    staleTime: 60 * 1000, // 1 minute
    initialData: () => this.queryClient.getQueryData<Contact[] | undefined>(['contacts', ''])?.find((contact) => contact.id === this.currentId()),
    initialDataUpdatedAt: () => this.queryClient.getQueryState(['contacts', ''])?.dataUpdatedAt
  }));

  public contacts = injectQuery<Contact[]>(() => ({
    queryKey: ['contacts', this.filter()],
    queryFn: () => {
      // console.log('in getContact$ with id', id);
      return lastValueFrom(this.http.get<Contact[]>(`${URL}?q=${this.filter()}`));
    },
    staleTime: 60 * 1000, // 1 min
    persister: experimental_createPersister({
      storage: localStorage
    })
  }));

  public mutationSave = injectMutation(() => ({
    mutationFn: (contact: Contact) => {
      // console.log('Save mutate contact:', contact);
      return lastValueFrom(this.saveFn(contact));
    },
    onMutate: async (contact) => {
      // cancel potential queries
      await this.queryClient.cancelQueries({ queryKey: ['contacts'] });


      const savedCache = this.queryClient.getQueryData(['contacts', '']);
      // console.log('savedCache', savedCache);
      this.queryClient.setQueryData(['contacts', ''], (contacts: Contact[]) => {
        if (contact.id) {
          return contacts.map((contactCache) =>
            contactCache.id === contact.id ? contact : contactCache
          );
        }
        // optimistic update
        return contacts.concat({ ...contact, id: Math.random().toString() });
      });
      return () => {
        this.queryClient.setQueryData(['contacts', ''], savedCache);
      };
    },
    onSuccess: (data: Contact, contact: Contact, restoreCache: () => void) => {
      // Should we update the cache of a "contact" here ?
      restoreCache();
      this.queryClient.setQueryData(['contact', data.id], data);
      this.queryClient.setQueryData(['contacts', ''], (contactsCache: Contact[]) => {
        if (contact.id) {
          return contactsCache.map((contactCache) =>
            contactCache.id === contact.id ? contact : contactCache
          );
        }
        return contactsCache.concat(data);
      });
    },
    onError: async (_error, variables, context) => {
      context?.();
      await this.settledFn(variables.id);
    }
  }));

  public mutationDelete = injectMutation(() => ({
    mutationFn: (id: string) => {
      // console.log('Save mutate contact:', contact);
      return lastValueFrom(this.removeFn(id));
    },
    onMutate: (id: string) => {
      const savedCache = this.queryClient.getQueryData<Contact[]>(['contacts', '']);
      // console.log('savedCache', savedCache);
      this.queryClient.setQueryData(['contacts', ''], (contacts: Contact[]) =>
        // optimistic update
        contacts.filter((contactCached) => contactCached.id !== id)
      );
      return () => {
        this.queryClient.setQueryData(['contacts', ''], savedCache);
      };
    },
    onError: async (_error, variables, context) => {
      context?.();
      await this.settledFn(variables);
    },
    onSettled: (_data: Contact | undefined, _error, variables, _context) => this.settledFn(variables)
  }));

  public infiniteQuery = injectInfiniteQuery(() => ({
    queryKey: ['contacts'],
    queryFn: ({ pageParam }) => {
      return lastValueFrom(this.getInfiniteContacts(pageParam));
    },
    initialPageParam: this.currentPage(),
    getPreviousPageParam: (firstPage) => firstPage.prev ?? undefined,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    persister: experimental_createPersister({
      storage: localStorage
    }) as any
  }));


  public nextButtonDisabled = computed(
    () => !this.#hasNextPage() || this.#isFetchingNextPage()
  );
  public nextButtonText = computed(() =>
    this.#isFetchingNextPage()
      ? 'Loading more...'
      : this.#hasNextPage()
        ? 'Load newer'
        : 'Nothing more to load'
  );
  public previousButtonDisabled = computed(
    () => !this.#hasPreviousPage() || this.#isFetchingNextPage()
  );
  public previousButtonText = computed(() =>
    this.#isFetchingPreviousPage()
      ? 'Loading more...'
      : this.#hasPreviousPage()
        ? 'Load Older'
        : 'Nothing more to load'
  );

  readonly #hasPreviousPage = this.infiniteQuery.hasPreviousPage;
  readonly #hasNextPage = this.infiniteQuery.hasNextPage;
  readonly #isFetchingPreviousPage = this.infiniteQuery.isFetchingPreviousPage;
  readonly #isFetchingNextPage = this.infiniteQuery.isFetchingNextPage;


  constructor() {
    effect(async () => { if (!this.nextButtonDisabled()) {
      await this.fetchNextPage();
    }});
  }

  public async settledFn(contactId: string | undefined) {
    await this.queryClient.invalidateQueries({ queryKey: ['contacts']});
    if (contactId) {
      await this.queryClient.invalidateQueries({ queryKey: ['contact', contactId]});
    }
  }

  public saveFn(contact: Contact) {
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

  public async fetchNextPage() {
    // Do nothing if already fetching
    if (this.infiniteQuery.isFetching()) {
      return;
    }
    await this.infiniteQuery.fetchNextPage();
  }
}
