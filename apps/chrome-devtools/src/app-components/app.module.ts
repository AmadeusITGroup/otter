import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppConnectionModule } from '../components/app-connection/app-connection.module';
import { OtterComponentModule } from '../components/otter-component/otter-component.module';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    OtterComponentModule,
    AppConnectionModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
