import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfigFormComponent } from './config-form.component';


@NgModule({
  declarations: [
    ConfigFormComponent
  ],
  exports: [
    ConfigFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ConfigFormModule { }
