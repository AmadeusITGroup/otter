import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { RulesetHistoryPresModule } from '@o3r/rules-engine';
import { AppComponent } from './app.component';
import { ConfigPanelPresModule } from './config-panel/config-panel-pres.module';
import { DebugPanelPresModule } from './debug-panel/debug-panel-pres.module';
import { ComponentPanelPresModule } from './component-panel/component-panel-pres.module';
import { AppConnectionModule } from '../components/app-connection/app-connection.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbNavModule,
    DebugPanelPresModule,
    RulesetHistoryPresModule,
    ConfigPanelPresModule,
    ComponentPanelPresModule,
    AppConnectionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
