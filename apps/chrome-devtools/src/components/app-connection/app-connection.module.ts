import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppConnectionComponent } from './app-connection.component';

@NgModule({
  declarations: [AppConnectionComponent],
  exports: [AppConnectionComponent],
  imports: [CommonModule]
})
export class AppConnectionModule { }
