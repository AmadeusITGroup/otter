import {
  EOL
} from 'node:os';
import * as chalk from 'chalk';
import {
  Arguments,
  terminalWidth
} from 'yargs';

/**
 * Format a text to a title
 * @param text text of the title
 */
export const formatTitle = (text: string) => {
  const titleDecoratorSize = Math.min(Math.floor((terminalWidth() || 0) / 2) || 80, 80);
  return `${chalk.grey('---')} ${chalk.bold(text)} ${chalk.grey(Array.from({ length: titleDecoratorSize - text.length - 5 }).fill('-').join(''))}`;
};

const formatHelpOptionsBlocks = (initialMessage: string, groups: string[]) => {
  return groups.reduce((message, group) => {
    const groupRegExp = new RegExp(`^${group}`);
    const lines = message.split(/\n\r?/);
    const firstLine = lines.findIndex((line) => groupRegExp.test(line)) + 1;
    if (firstLine) {
      let lineNumber = lines.slice(firstLine).findIndex((line) => /^[^ ]/.test(line));
      if (lineNumber === -1) {
        lineNumber = lines.length - firstLine;
      }

      message = lines
        .map((line, idx) => {
          if (idx < firstLine || idx >= lineNumber + firstLine) {
            return line;
          }
          const indexSep = line.match(/^ +.+? {2}/)?.[0]?.length;
          if (!indexSep) {
            return line;
          }

          return line
            .substring(0, indexSep)
            .replace(/(([^- ,][^ ,]*)+)/g, chalk.cyan('$1'))
            .replace(/( -+)/g, chalk.white('$1'))
            + line.substring(indexSep)
              .replace(/ (\[.+\])[\s]*$/, ' ' + chalk.grey('$1'))
              .replace(/(\[required])(.+)$/g, chalk.red('$1') + chalk.grey('$2'));
        }).join(EOL);
    }
    return message
      .replace(new RegExp(`^${group}`, 'gm'), chalk.grey(group));
  }, initialMessage);
};

const formatHelpCommandsBlock = (message: string, commandContext?: Arguments) => {
  const lines = message.split(/\n\r?/);
  const firstLine = lines.findIndex((line) => line.startsWith('Commands:')) + 1;
  if (firstLine) {
    let lineNumber = lines.slice(firstLine).findIndex((line) => /^[^ ]/.test(line));
    if (lineNumber === -1) {
      lineNumber = lines.length - firstLine;
    }
    message = lines
      .map((line, idx) => {
        if (idx < firstLine || idx >= lineNumber + firstLine) {
          return line;
        }
        const indexSep = line.match(/^ +.+? {2}/)?.[0]?.length;
        if (!indexSep) {
          return line;
        }
        return line
          .substring(0, indexSep)
          .replace(new RegExp(`(${commandContext ? [commandContext.$0, ...commandContext._].join(' ') : ''}) (.*)`), `${chalk.italic('$1')} ${chalk.cyan('$2')}`)
          + line.substring(indexSep)
            .replace(/ (\[.+\])[\s]*$/, ' ' + chalk.grey('$1'));
      }).join(EOL);
  }
  return message
    .replace(/^Commands:/gm, chalk.grey('Commands:'));
};

const formatHelpPositionalsBlock = (message: string) => {
  const lines = message.split(/\n\r?/);
  const firstLine = lines.findIndex((line) => line.startsWith('Positionals:')) + 1;
  if (firstLine) {
    let lineNumber = lines.slice(firstLine).findIndex((line) => /^[^ ]/.test(line));
    if (lineNumber === -1) {
      lineNumber = lines.length - firstLine;
    }
    message = lines
      .map((line, idx) => {
        if (idx < firstLine || idx >= lineNumber + firstLine) {
          return line;
        }
        const indexSep = line.match(/^ +.+? {2}/)?.[0]?.length;
        if (!indexSep) {
          return line;
        }
        return line
          .substring(0, indexSep)
          .replace(/(.*)/g, chalk.cyan('$1'))
          + line.substring(indexSep, line.length - 1)
            .replace(/ (\[.+\])[\s]*$/, ' ' + chalk.grey('$1'));
      }).join(EOL);
  }
  return message
    .replace(/^Positionals:/gm, chalk.grey('Positionals:'));
};

const findOptionGroups = (message: string) => {
  const lines = message.split(/\n\r?/);
  let searching = true;
  return lines.reduce((acc, line, idx) => {
    const isOptionLine = /^ +-/.test(line);
    if (searching && isOptionLine) {
      acc.push(lines[idx - 1]);
      searching = false;
    } else if (!isOptionLine) {
      searching = true;
    }
    return acc;
  }, [] as string[]);
};

const cleanProvidedOptionReported = (message: string) => {
  let optionWithDescription = false;
  const lines = message.split(/\n\r?/)
    .reverse()
    .filter((line) => {
      if (line === '') {
        return true;
      }
      if (!optionWithDescription) {
        optionWithDescription = !/^ +-/.test(line) || /^ +-[^ ]+ +[^ ]+/.test(line);
      }
      return optionWithDescription;
    });

  // clean empty blocks
  let sliceEmptyBlock = 0;
  let i = 0;
  while (lines[i] === '' || i === 0) {
    if (lines[++i].includes('Options:')) {
      sliceEmptyBlock = i + 1;
    }
  }

  return lines
    .slice(sliceEmptyBlock)
    .reverse()
    .join(EOL);
};

/**
 * Change default display of the help command result
 * @param message default help message
 * @param commandContext options of the executed command
 */
export const formatHelpMessage = (message: string, commandContext?: Arguments) => {
  message += EOL;
  message = formatHelpOptionsBlocks(message, findOptionGroups(message));
  message = formatHelpPositionalsBlock(message);
  message = formatHelpCommandsBlock(message, commandContext);
  message = cleanProvidedOptionReported(message);

  return message;
};
