import {
  type CancellationToken,
  chat,
  type ChatContext,
  type ChatRequest,
  type ChatRequestHandler,
  type ChatResponseStream,
  type ChatResult,
  type ExtensionContext,
  lm,
  type OutputChannel,
  type TelemetryLogger,
  Uri,
  workspace,
} from 'vscode';
import {
  sendChatParticipantRequest,
} from '@vscode/chat-extension-utils';

const SUPPORTED_COMMANDS = ['list-tools', 'list-repos-using-o3r'];
const SUPPORTED_TOOLS_REGEX = /o3r|angular|github|playwright/;

export const initializeChatParticipant = (context: ExtensionContext, channel: OutputChannel, telemetryLogger: TelemetryLogger) => {
  const o3rChatParticipant = chat.createChatParticipant('o3r-chat-participant', chatParticipantHandler(context, channel, telemetryLogger));
  o3rChatParticipant.iconPath = Uri.joinPath(context.extensionUri, 'assets', 'logo-128x128.png');
  return o3rChatParticipant;
};

const chatParticipantHandler = (_context: ExtensionContext, _channel: OutputChannel, telemetryLogger: TelemetryLogger): ChatRequestHandler => {
  return async (
    request: ChatRequest,
    chatContext: ChatContext,
    stream: ChatResponseStream,
    token: CancellationToken
  ): Promise<ChatResult> => {
    const command = SUPPORTED_COMMANDS.includes(request.command || '') ? request.command : '';
    const config = workspace.getConfiguration('otter.mcp').get<string>('additionalToolsRegexp');
    const additionalToolsRegExp = config && new RegExp(config);
    let tools = lm.tools.filter((tool) => SUPPORTED_TOOLS_REGEX.test(tool.name) || (additionalToolsRegExp && additionalToolsRegExp.test(tool.name)));

    switch (command) {
      case 'list-tools': {
        stream.markdown(tools.map((tool) => `- ${tool.name}`).join('\n'));
        telemetryLogger.logUsage('Chat interaction', { command, model: request.model.name });
        return { metadata: { command } };
      }
      case 'list-repos-using-o3r': {
        tools = tools.filter((tool) => tool.name.includes('get_repositories_using_otter'));
        break;
      }
    }
    const { result } = sendChatParticipantRequest(
      request,
      chatContext,
      {
        prompt: ` You are Ottie the otter !
                  Use tools when it is possible to answer precisely the user's question. Prefer using the o3r tools.
                  If you don't know the answer, just say you don't know. Never make up an answer.`,
        responseStreamOptions: {
          stream,
          references: true,
          responseText: true
        },
        tools
      },
      token
    );
    try {
      const awaitedResult = await result;
      telemetryLogger.logUsage('Chat interaction', { command, error: awaitedResult.errorDetails, model: request.model.name });
      return awaitedResult;
    } catch (e: any) {
      telemetryLogger.logUsage('Chat interaction error', { command, error: e instanceof Error ? e.message : e, model: request.model.name });
      throw e;
    }
  };
};
