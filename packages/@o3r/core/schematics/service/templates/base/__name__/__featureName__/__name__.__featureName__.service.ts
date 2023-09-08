import {Injectable} from '@angular/core';
import {<%= serviceName %>Module} from './<%= name %>.<%= featureName %>.module';

/**
 * <%= name %> service
 * Add description to the service
 */
@Injectable({
  providedIn: <%= serviceName %>Module
})
export class <%= serviceName %> {
  constructor() { }
}
