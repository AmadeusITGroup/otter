import {
  ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Directive, Input, KeyValueChangeRecord, KeyValueDiffer,
  KeyValueDiffers, OnChanges, OnDestroy, SimpleChange, SimpleChanges, ViewContainerRef
} from '@angular/core';
import type { DynamicConfigurable } from '@o3r/configuration';
import type { BaseContextOutput, Configuration, Context, ContextInput, Functionify } from '@o3r/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[c11n]'
})
export class C11nDirective <
  D extends Configuration = Configuration,
  I extends ContextInput = ContextInput,
  O extends BaseContextOutput = BaseContextOutput> implements OnChanges, OnDestroy {

  /** The component information passed to the directive */
  @Input() public component!: Context<I, O> & DynamicConfigurable<D>;

  /** The information related to configuration */
  @Input() public config?: D;

  /** The input setter */
  @Input() public set inputs(value: {[K in keyof I]: I[K]}) {
    this._inputs = value;
    if (!this.differInputs && value) {
      this.differInputs = this.differsService.find(value).create();
    }
  }

  /** The input getter */
  public get inputs(): {[K in keyof I]: I[K]} {
    return this._inputs;
  }

  /** The information related to output */
  @Input() public outputs?: Functionify<O>;

  /** The component reference */
  public componentRef!: ComponentRef<Context<I, O> & DynamicConfigurable<D>>;

  private componentSubscriptions: Subscription[] = [];

  private _inputs!: {[K in keyof I]: I[K]};

  private differInputs!: KeyValueDiffer<string, any>;

  /** Set of inputs when the component was created. */
  private readonly uninitializedInputs = new Set<string>();

  constructor(public viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private differsService: KeyValueDiffers) {
  }

  private updateInputs(record: KeyValueChangeRecord<string, any>, inputChanges: SimpleChanges) {
    const recordKey = record.key;
    const isFirstChange = this.uninitializedInputs.has(recordKey);
    this.uninitializedInputs.delete(recordKey);
    (this.componentRef.instance[recordKey] as {[K in keyof I]: I[K]}) = record.currentValue;
    inputChanges[recordKey] = new SimpleChange(record.previousValue, record.currentValue, isFirstChange);
  }

  /**
   * called when data-bound property change
   *
   * @param changes The changes that occur
   */
  public ngOnChanges(changes: SimpleChanges) {

    const inputChanges: SimpleChanges = {};

    if (changes.component && changes.component.currentValue) {

      if (this.componentRef) {
        this.componentSubscriptions.forEach((s) => s.unsubscribe());
        this.componentSubscriptions = [];
        this.componentRef.destroy();
      }

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory<Context<I, O> & DynamicConfigurable<D>>(changes.component.currentValue);

      componentFactory.inputs.forEach((prop) => {
        this.uninitializedInputs.add(prop.propName);
      });

      this.viewContainerRef.clear();
      this.componentRef = this.viewContainerRef.createComponent<Context<I, O> & DynamicConfigurable<D>>(componentFactory);

      // Initialize outputs
      if (this.outputs) {
        const subscriptions = Object.keys(this.outputs).map((outputName) => this.componentRef.instance[outputName].subscribe((val: any) => this.outputs![outputName](val)));
        this.componentSubscriptions.push(...subscriptions);
      }

      // In case of async component change keep the inputs
      if (!changes.inputs && this.inputs) {
        Object.keys(this.inputs).forEach((inputName) => {
          const currentInputValue = this.inputs[inputName];
          inputChanges[inputName] = new SimpleChange(undefined, currentInputValue, true);
          (this.componentRef.instance[inputName] as {[K in keyof I]: I[K]}) = currentInputValue;
          this.uninitializedInputs.delete(inputName);
        });
      }
      // In case of lazy loaded component keep the config
      if (!changes.config && this.config) {
        this.componentRef.instance.config = {...this.componentRef.instance.config, ...this.config};
        inputChanges.config = new SimpleChange(this.componentRef.instance.config, this.config, true);
        this.uninitializedInputs.delete('config');
      }
    }

    if (this.componentRef && this.differInputs) {
      const changesInInputs = this.differInputs.diff(this.inputs);
      if (changesInInputs) {
        changesInInputs.forEachAddedItem((record) => this.updateInputs(record, inputChanges));
        changesInInputs.forEachChangedItem((record) => this.updateInputs(record, inputChanges));
        changesInInputs.forEachRemovedItem((record) => this.updateInputs(record, inputChanges));
      }
    }

    if (this.componentRef && changes.config) {
      this.componentRef.instance.config = {...this.componentRef.instance.config, ...changes.config.currentValue};
      inputChanges.config = new SimpleChange(this.componentRef.instance.config, changes.config.currentValue, this.uninitializedInputs.has('config'));
      this.uninitializedInputs.delete('config');
    }

    if (this.componentRef && this.componentRef.instance.ngOnChanges && Object.keys(inputChanges).length) {
      this.componentRef.instance.ngOnChanges(inputChanges);
      this.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this.componentSubscriptions.forEach((s) => s.unsubscribe());
    this.componentRef.destroy();
  }

}
