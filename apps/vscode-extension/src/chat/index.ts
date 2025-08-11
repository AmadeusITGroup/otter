import {
  readFile,
} from 'node:fs/promises';
import {
  type CancellationToken,
  type ChatContext,
  type ChatRequest,
  type ChatRequestHandler,
  type ChatResponseStream,
  type ChatResult,
  type ExtensionContext,
  LanguageModelChatMessage,
  type OutputChannel,
  Uri,
} from 'vscode';

const SUPPORTED_COMMANDS = ['new'];

/* eslint-disable new-cap -- restricted by LanguageModelChatMessage typing */
export const chatParticipantHandler = async (context: ExtensionContext, channel: OutputChannel): Promise<ChatRequestHandler> => {
  const genAIResourcesPath = Uri.joinPath(context.extensionUri, 'assets', 'gen-ai');
  const retrieveFile = async (path: string) => {
    channel.appendLine(`Retrieve ${path}...`);
    const content = await readFile(
      Uri.joinPath(genAIResourcesPath, path).fsPath,
      { encoding: 'utf8' }
    );
    channel.appendLine(`${path} retrieved!`);
    return content;
  };
  channel.appendLine('Retrieve developer.md...');
  const developer = await retrieveFile('developer.md');
  return async (
    request: ChatRequest,
    _handlerContext: ChatContext,
    stream: ChatResponseStream,
    token: CancellationToken
  ): Promise<ChatResult> => {
    const command = SUPPORTED_COMMANDS.includes(request.command || '') ? request.command : '';
    channel.appendLine(`Chat assistant called with command: ${command}`);

    const messages = [LanguageModelChatMessage.User(developer)];

    switch (command) {
      case 'new': {
        const createOutput = await retrieveFile('create/output.md');
        messages.push(LanguageModelChatMessage.User(createOutput));
        break;
      }
      default: {
        const bestPracticesOutput = await retrieveFile('best-practices/output.md');
        messages.push(LanguageModelChatMessage.User(bestPracticesOutput));
        break;
      }
    }
    messages.push(LanguageModelChatMessage.User(request.prompt));
    channel.appendLine(`Prompts sent:`);
    messages.forEach((m) => channel.appendLine(JSON.stringify(m, null, 2)));
    const chatResponse = await request.model.sendRequest(messages, {}, token);
    for await (const fragment of chatResponse.text) {
      stream.markdown(fragment);
    }
    return { metadata: { command } };
  };
};
