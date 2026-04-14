import {
  env,
  type OutputChannel,
  workspace,
} from 'vscode';
import {
  getEnvironmentInfo,
  sendData,
} from '@o3r/telemetry';

const isTelemetryEnabled = () => env.isTelemetryEnabled || workspace.getConfiguration('otter.telemetry').get('enable');

const VSCODE_KEY_REGEX = /^common\.(?:vscode)?/;

const sendTelemetry = async (eventName: string, data: Record<string, any>, channel: OutputChannel) => {
  const envInfo = await getEnvironmentInfo();
  const { vscode, additionalInfo } = Object.entries(data).reduce(
    (acc: { vscode: Record<string, any>; additionalInfo: Record<string, any> }, [key, value]) => {
      if (VSCODE_KEY_REGEX.test(key)) {
        const vscodeKey = key.replace(VSCODE_KEY_REGEX, '');
        acc.vscode[vscodeKey] = value;
      } else {
        acc.additionalInfo[key] = value;
      }
      return acc;
    },
    { vscode: {}, additionalInfo: {} }
  );

  const fullData = {
    eventName,
    data: additionalInfo,
    environment: {
      ...envInfo,
      vscode
    }
  };
  return sendData(fullData, {
    error: (err) => channel.appendLine(`${err}\n`)
  }).catch((e: any) => {
    channel.appendLine(`Error while sending telemetry: ${e instanceof Error ? e.message : e}`);
  });
};

export const createTelemetryLogger = (channel: OutputChannel) => env.createTelemetryLogger({
  sendErrorData: (error, data) => {
    if (!isTelemetryEnabled()) {
      return;
    }
    void sendTelemetry('error', { ...data, error }, channel);
  },
  sendEventData: (eventName, data = {}) => {
    if (!isTelemetryEnabled()) {
      return;
    }
    void sendTelemetry(eventName, data, channel);
  }
});
