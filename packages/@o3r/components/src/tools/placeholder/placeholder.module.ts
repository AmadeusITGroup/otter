import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { PlaceholderTemplateStoreModule } from '../../stores/placeholder-template/index';
import { PlaceholderComponent } from './placeholder.component';

@NgModule({
  imports: [
    CommonModule,
    StoreModule,
    PlaceholderTemplateStoreModule
  ],
  declarations: [PlaceholderComponent],
  exports: [PlaceholderComponent]
})
export class PlaceholderModule { }
