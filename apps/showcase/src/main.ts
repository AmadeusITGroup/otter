import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'bootstrap';
import { AppModule } from './app/app.module';
import '@angular/localize/init';

document.body.dataset.dynamiccontentpath = localStorage.getItem('dynamicPath') || '';
platformBrowserDynamic().bootstrapModule(AppModule)
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
