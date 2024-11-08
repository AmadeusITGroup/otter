#!/usr/bin/env node
import {
  EOL,
} from 'node:os';
import type {
  Context,
  RootContext,
  ProgressBar as SimpleProgressBar,
  Task,
} from '@ama-terasu/core';
import * as chalk from 'chalk';
import * as logger from 'loglevel';
import {
  error,
} from 'loglevel';
import {
  default as ora,
  oraPromise,
} from 'ora';
import ProgressBar from 'progress';
import {
  Arguments,
  Argv,
  terminalWidth,
} from 'yargs';
import {
  formatHelpMessage,
} from '../helpers';

/**
 * Generate a formatted usage message
 * @param moduleName Nome of the module
 * @param command CLI Command
 * @param longDescription Long description of the command to add additional information
 * @param cmdParameters Parameters of the command
 * @param baseCommand Argument of the cli
 */
export const generateUsageMessage = (moduleName: string, command?: string, longDescription?: string, cmdParameters = '[options]', baseCommand = '$0') => {
  return `${chalk.grey('Usage:')} ${baseCommand} ${chalk.cyan(moduleName)}${command ? ' ' + command : ''} ${chalk.grey(cmdParameters)}`
    + (longDescription ? `${EOL}${EOL}${chalk.grey('Description:')}${EOL}${longDescription}` : '');
};

/**
 * Show Help message
 * @param amaYargs instance of current Yarg
 * @param arg Argument of the command
 */
export const showHelpMessage = (amaYargs: Argv, arg: Arguments) => {
  amaYargs.showHelp((message) => error(formatHelpMessage(message, arg)));
  process.exit(0);
};

/** @inheritdoc */
export const getSpinner: Context['getSpinner'] = (initialLabel): Task => {
  const spinner = ora({
    color: 'cyan',
    text: initialLabel,
    interval: 500
  });

  return {
    start: () => !spinner.isSpinning && spinner.start(),
    updateLabel: (label) => {
      spinner.text = label;
    },
    fail: (text) => spinner.isSpinning && spinner.fail(text),
    succeed: (text) => spinner.isSpinning && spinner.succeed(text),
    fromPromise: (promise, successText, failText) =>
      oraPromise(promise, { text: initialLabel, successText, failText })
  };
};

/** @inheritdoc */
const getProgressBar: Context['getProgressBar'] = (total, initialLabel): SimpleProgressBar => {
  const progress = new ProgressBar(`[:bar] ${chalk.grey('(:current/:total)')} :label`, {
    total,
    width: Math.floor(terminalWidth() / 4),
    incomplete: chalk.gray('-')
  });

  progress.render({ label: initialLabel });

  return {
    complete: () => {
      progress.update(1);
      progress.terminate();
    },
    tick: (update) => {
      const { label, value } = update || {};
      if (typeof value !== 'undefined') {
        return progress.update(progress.total / value, { label });
      }
      progress.tick({ label });
    }
  };
};

/**
 * Base context of a CLI module
 */
export const baseContext: RootContext = {
  generateUsageMessage,
  showHelpMessage,
  getSpinner,
  getProgressBar,
  logger,
  getContext: (config) => {
    const newLogger = logger.getLogger(config._?.join('-') || 'default');
    newLogger.setLevel(config.verbose ? logger.levels.DEBUG : logger.levels.INFO);
    return {
      logger: newLogger,
      getProgressBar,
      getSpinner
    };
  }
};
