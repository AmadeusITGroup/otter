#!/usr/bin/env node

import * as prompts from 'prompts';
import { amaYargs } from '../modules/base-yargs';

(() => (prompts as any).override(amaYargs.argv))();
