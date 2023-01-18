import { SdkGenerator } from '../sdk-generator';

module.exports = class extends SdkGenerator {

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    this.desc('Create a new SDK package');
  }

  public initializing() {
    this.composeWith(require.resolve('../shell'), {sdkPath: this.destinationRoot()});
    this.composeWith(require.resolve('../core'), {sdkPath: this.destinationRoot()});
  }

};
