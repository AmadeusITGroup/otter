# Create custom fact in your application

First of all, you need to create the observable that will emit the value of the fact everytime it changes. You can plug to any existing store to get the data.

Example with order: 
```typescript
export const getCurrentOrder = () => (source: Observable<OrderStore>) =>
  source.pipe(
    filter((store) => !!store.order),
    select(selectCurrentOrder),
    distinctUntilChanged()
  );
```
As we can see, we pipe a filter operator to ensure that the order store is defined, it allows to register the fact even if the store is lazy loaded later in the flow.
This observable will not emit until the store is loaded, but the rules engine will create the first emission (undefined) while waiting for getCurrentOrder to emit its first value.

Then, you need to create an associated service and the interface:
```typescript
@Injectable()
export class OrderFactsService extends FactsService<OrderFacts> {

  public facts = {
    currentOrder: this.store.pipe(getCurrentOrder())
  };

  constructor(rulesEngine: RulesEngineService, private store: Store<OrderStore>) {
    super(rulesEngine);
  }
}
```
```typescript
export interface OrderFacts extends FactDefinitions {
  /**
   * Current Order
   */
  currentOrder: OrderModel;
}
```


And the module (Note that you do not import CartStore here):
```typescript

@NgModule({
  imports: [
    RulesEngineModule
  ],
  providers: [
    OrderFactsService
  ]
})
export class OrderFactsModule { }
```

Finally, import it your app module, inject the service in your app component and register the facts:
```typescript
public ngOnInit() {
  //...
  this.orderFactsService.register();
}
```

IMPORTANT: Don't forget to add the facts files' path to the CMS extractor, as mentioned in [How to integrate](./integration.md) 
