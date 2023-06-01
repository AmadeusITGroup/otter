import 'isomorphic-fetch';
import 'jest-preset-angular/setup-jest';
import '@angular/localize/init';
import { TextEncoder } from 'node:util';
global.TextEncoder = TextEncoder;
