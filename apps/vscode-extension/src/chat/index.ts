import {
  type CancellationToken,
  type ChatContext,
  type ChatRequest,
  type ChatRequestHandler,
  type ChatResponseStream,
  type ChatResult,
  type ExtensionContext,
  lm,
  type OutputChannel,
} from 'vscode';
import {
  sendChatParticipantRequest,
} from '@vscode/chat-extension-utils';

const SUPPORTED_COMMANDS = ['list-tools'];
const SUPPORTED_TOOLS_REGEX = /o3r|angular/;

export const chatParticipantHandler = (_context: ExtensionContext, _channel: OutputChannel): ChatRequestHandler => {
  return async (
    request: ChatRequest,
    chatContext: ChatContext,
    stream: ChatResponseStream,
    token: CancellationToken
  ): Promise<ChatResult> => {
    const command = SUPPORTED_COMMANDS.includes(request.command || '') ? request.command : '';
    const tools = lm.tools.filter((tool) => SUPPORTED_TOOLS_REGEX.test(tool.name));

    switch (command) {
      case 'list-tools': {
        stream.markdown(tools.map((tool) => `- ${tool.name}`).join('\n'));
        return { metadata: { command } };
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
    return result;
  };
};
