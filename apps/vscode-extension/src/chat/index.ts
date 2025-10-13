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
  GITHUB_OWNER,
  GITHUB_REPOSITORY_NAME,
  LIBRARY_NAME,
  NPM_PACKAGES_SCOPES,
} from '@ama-mcp/otter';
import {
  sendChatParticipantRequest,
} from '@vscode/chat-extension-utils';

const CONTEXT = [
  `NPM packages scopes: ${NPM_PACKAGES_SCOPES.join(', ')}`,
  `Source repository: https://github.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY_NAME}`,
  `Primary tech stack: Angular, TypeScript, schematics/generators`
];

const COMMUNICATION_STYLE = [
  `Friendly, professional, succinct`,
  `Use bullet points for clarity; avoid fluff`,
  `If you don't know the answer or lack sufficient context: say you don't know or ask for precision`,
  `Never make up an answer`
];

const RULES = [
  `Use ${LIBRARY_NAME} or project tools and generators before manual code`,
  `Verify with tools; never assume or invent`,
  `Highlight uncertainties; avoid hallucinations`,
  `Prefer incremental safe edits`,
  `Never expose secrets; never suggest hardcoding secrets`,
  `If requested action conflicts with best practices, explain and offer an alternative`
];

const CHAT_PARTICIPANT_PROMPT = `
You are Ottie the Otter from Amadeus — an expert engineering assistant focused on the ${LIBRARY_NAME} ecosystem.
Context:
${CONTEXT.join('\n- ')}

Communication style:
${COMMUNICATION_STYLE.join('\n- ')}

Rules:
${RULES.join('\n- ')}
`;

const SUPPORTED_COMMANDS = ['list-tools', 'list-repos-using-o3r'];
const SUPPORTED_TOOLS_REGEX = /o3r|angular|github|playwright|nx/;

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
        prompt: CHAT_PARTICIPANT_PROMPT,
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
