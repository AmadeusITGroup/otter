import {
  chat,
  commands,
  EventEmitter,
  ExtensionContext,
  languages,
  lm,
  Uri,
  window,
} from 'vscode';
import {
  chatParticipantHandler,
} from './chat';
import {
  extractAllToVariable,
} from './commands/extract/styling/extract-all-to-variable.command';
import {
  extractToVariable,
} from './commands/extract/styling/extract-to-variable.command';
import {
  generateComponentGenerateCommand,
} from './commands/generate/component.command';
import {
  generateAddAnalyticsToComponentCommand,
  generateAddConfigurationToComponentCommand,
  generateAddContextToComponentCommand,
  generateAddFixtureToComponentCommand,
  generateAddIframeToComponentCommand,
  generateAddLocalizationKeyToComponentCommand,
  generateAddLocalizationToComponentCommand,
  generateAddRulesEngineToComponentCommand,
  generateAddThemingToComponentCommand,
  generateConvertComponentCommand,
} from './commands/generate/enrich-component';
import {
  generateFixtureGenerateCommand,
} from './commands/generate/fixture.command';
import {
  generateModuleGenerateCommand,
} from './commands/generate/module.command';
import {
  generateServiceGenerateCommand,
} from './commands/generate/service.command';
import {
  generateStoreGenerateCommand,
} from './commands/generate/store.command';
import {
  wrapCommandWhenExplorerContext,
} from './commands/helpers';
import {
  generateModuleAddCommand,
} from './commands/module/add-module.command';
import {
  configurationCompletionItemProvider,
  configurationCompletionTriggerChar,
} from './intellisense/configuration';
import {
  designTokenCompletionItemAndHoverProviders,
} from './intellisense/design-token';
import {
  stylingCompletionItemProvider,
  stylingCompletionTriggerChar,
} from './intellisense/styling';
import {
  mcpConfig,
} from './mcp';

/**
 * Function to register commands.
 * This function is called by VSCode when the extension is activated.
 * @param context
 */
export function activate(context: ExtensionContext) {
  const channel = window.createOutputChannel('Otter');
  const o3rChatParticipant = chat.createChatParticipant('o3r-chat-participant', chatParticipantHandler(context, channel));
  o3rChatParticipant.iconPath = Uri.joinPath(context.extensionUri, 'assets', 'logo-128x128.png');
  const designTokenProviders = designTokenCompletionItemAndHoverProviders();
  // eslint-disable-next-line unicorn/prefer-event-target -- using EventEmitter from vscode
  const didChangeEmitter = new EventEmitter<void>();

  context.subscriptions.push(
    o3rChatParticipant,
    lm.registerMcpServerDefinitionProvider('o3rMCPServerProvider', mcpConfig(didChangeEmitter)),
    languages.registerCompletionItemProvider(['javascript', 'typescript'], configurationCompletionItemProvider({ channel }), configurationCompletionTriggerChar),
    languages.registerCompletionItemProvider(['scss'], stylingCompletionItemProvider(), stylingCompletionTriggerChar),
    languages.registerCompletionItemProvider(['scss', 'css'], designTokenProviders),
    languages.registerHoverProvider(['scss', 'css'], designTokenProviders),
    commands.registerCommand('otter.generate.component', generateComponentGenerateCommand(context)),
    commands.registerCommand('otter.generate.service', generateServiceGenerateCommand(context)),
    commands.registerCommand('otter.generate.store', generateStoreGenerateCommand(context)),
    commands.registerCommand('otter.generate.module', generateModuleGenerateCommand(context)),
    commands.registerCommand('otter.generate.analytics-to-component', generateAddAnalyticsToComponentCommand),
    commands.registerCommand('otter.generate.configuration-to-component', generateAddConfigurationToComponentCommand),
    commands.registerCommand('otter.generate.context-to-component', generateAddContextToComponentCommand),
    commands.registerCommand('otter.generate.convert-component', generateConvertComponentCommand),
    commands.registerCommand('otter.generate.fixture-to-component', generateAddFixtureToComponentCommand),
    commands.registerCommand('otter.generate.iframe-to-component', generateAddIframeToComponentCommand),
    commands.registerCommand('otter.generate.localization-key-to-component', generateAddLocalizationKeyToComponentCommand),
    commands.registerCommand('otter.generate.localization-to-component', generateAddLocalizationToComponentCommand),
    commands.registerCommand('otter.generate.rules-engine-to-component', generateAddRulesEngineToComponentCommand),
    commands.registerCommand('otter.generate.theming-to-component', generateAddThemingToComponentCommand),
    commands.registerCommand('otter.menu.generate.component', wrapCommandWhenExplorerContext(context, generateComponentGenerateCommand)),
    commands.registerCommand('otter.menu.generate.service', wrapCommandWhenExplorerContext(context, generateServiceGenerateCommand)),
    commands.registerCommand('otter.menu.generate.store', wrapCommandWhenExplorerContext(context, generateStoreGenerateCommand)),
    commands.registerCommand('otter.menu.generate.module', wrapCommandWhenExplorerContext(context, generateModuleGenerateCommand)),
    commands.registerCommand('otter.generate.fixture', generateFixtureGenerateCommand(context)),
    commands.registerCommand('otter.menu.generate.fixture', generateFixtureGenerateCommand(context)),
    commands.registerCommand('otter.add.module', generateModuleAddCommand(context)),
    commands.registerTextEditorCommand('otter.extract.styling.variable', extractToVariable(context)),
    commands.registerTextEditorCommand('otter.extract.styling.allVariable', extractAllToVariable(context))
  );
}

/**
 * Function to deactivate commands.
 * This function is called by VSCode when the extension is deactivated.
 */
export function deactivate() {}
