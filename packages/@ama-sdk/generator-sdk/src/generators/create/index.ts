import { SdkGenerator } from '../sdk-generator';

module.exports = class extends SdkGenerator {

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    const deprecatedMessage = '[DEPRECATED] This generator is deprecated and will no longer be updated as of v10, please use @ama-sdk/schematics:typescript-create';

    this.log(deprecatedMessage);

    this.desc(`${deprecatedMessage}\nCreate a new SDK package`);
  }

  public initializing() {
    this.composeWith(require.resolve('../shell'), {sdkPath: this.destinationRoot()});
    this.composeWith(require.resolve('../core'), {sdkPath: this.destinationRoot()});
  }

};
