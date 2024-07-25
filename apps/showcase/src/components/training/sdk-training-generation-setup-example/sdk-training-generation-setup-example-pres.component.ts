import { Component } from '@angular/core';
import { CopyTextPresComponent } from '../../utilities';
import { SdkTrainingStepPresComponent } from '../sdk-training-step';

@Component({
  selector: 'o3r-sdk-training-generation-setup-example-pres',
  standalone: true,
  imports: [CopyTextPresComponent, SdkTrainingStepPresComponent],
  templateUrl: './sdk-training-generation-setup-example-pres.component.html',
  styleUrl: './sdk-training-generation-setup-example-pres.component.scss'
})
export class SdkTrainingGenerationSetupExamplePresComponent {
  public createSdkPrompt =
`λ yarn create @ama-sdk typescript training-sdk
? Project name (NPM package scope, package.json name will be @{projectName}/{packageName})? training-project`;

  public createSdkPrompt2 =
`λ yarn create @ama-sdk typescript training-sdk
yarn create v1.22.17
[1/4] Resolving packages...
warning @ama-sdk/create > @openapitools/openapi-generator-cli > glob@7.2.3: Glob versions prior to v9 are no longer supported
warning @ama-sdk/create > @openapitools/openapi-generator-cli > glob > inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Installed "@ama-sdk/create@11.0.0" with binaries:
      - create
? Project name (NPM package scope, package.json name will be @{projectName}/{packageName})? training-project`;

  public createSdkPromptResult =
`    "7.4.0"
CREATE training-sdk/.yarnrc.yml (111 bytes)
CREATE training-sdk/.commitlintrc.json (847 bytes)
CREATE training-sdk/.editorconfig (221 bytes)
CREATE training-sdk/.openapi-generator-ignore (91 bytes)
CREATE training-sdk/.swcrc (345 bytes)
CREATE training-sdk/.versionrc.json (119 bytes)
CREATE training-sdk/CONTRIBUTING.md (144 bytes)
CREATE training-sdk/jest.config.js (817 bytes)
CREATE training-sdk/readme.md (7222 bytes)
CREATE training-sdk/tsconfig.build.json (568 bytes)
CREATE training-sdk/tsconfig.doc.json (374 bytes)
CREATE training-sdk/tsconfig.json (240 bytes)
CREATE training-sdk/typedoc.json (301 bytes)
CREATE training-sdk/.vscode/settings.json (693 bytes)
CREATE training-sdk/configs/tsconfig.test.json (517 bytes)
CREATE training-sdk/src/index.ts (81 bytes)
CREATE training-sdk/src/api/fixtures.jest.ts (125 bytes)
CREATE training-sdk/src/api/index.ts (18 bytes)
CREATE training-sdk/src/fixtures/jest/index.ts (42 bytes)
CREATE training-sdk/src/fixtures/jest/package.json (381 bytes)
CREATE training-sdk/src/helpers/index.ts (18 bytes)
CREATE training-sdk/src/helpers/package.json (342 bytes)
CREATE training-sdk/src/models/enums.ts (97 bytes)
CREATE training-sdk/src/models/index.ts (134 bytes)
CREATE training-sdk/src/models/patterns.ts (106 bytes)
CREATE training-sdk/src/models/base/enums.ts (99 bytes)
CREATE training-sdk/src/models/base/index.ts (18 bytes)
CREATE training-sdk/src/models/base/patterns.ts (102 bytes)
CREATE training-sdk/src/models/core/enums.ts (50 bytes)
CREATE training-sdk/src/models/core/index.ts (51 bytes)
CREATE training-sdk/src/models/core/patterns.ts (53 bytes)
CREATE training-sdk/src/models/custom/enums.ts (52 bytes)
CREATE training-sdk/src/models/custom/index.ts (18 bytes)
CREATE training-sdk/src/models/custom/patterns.ts (55 bytes)
CREATE training-sdk/src/spec/api-mock.ts (125 bytes)
CREATE training-sdk/src/spec/index.ts (106 bytes)
CREATE training-sdk/src/spec/operation-adapter.ts (17 bytes)
CREATE training-sdk/src/spec/package.json (321 bytes)
CREATE training-sdk/src/spec/mock-factory/index.ts (51 bytes)
CREATE training-sdk/testing/tsconfig.spec.json (471 bytes)
CREATE training-sdk/tsconfigs/tsconfig.jest.json (339 bytes)
CREATE training-sdk/tsconfigs/tsconfig.source.json (255 bytes)
CREATE training-sdk/tsconfigs/esm2020/tsconfig.jest.json (373 bytes)
CREATE training-sdk/tsconfigs/esm2020/tsconfig.json (137 bytes)
CREATE training-sdk/tsconfigs/esm2020/tsconfig.source.json (298 bytes)
CREATE training-sdk/.eslintignore (141 bytes)
CREATE training-sdk/.eslintrc.js (1125 bytes)
CREATE training-sdk/.gitignore (1016 bytes)
CREATE training-sdk/.renovaterc.json (749 bytes)
CREATE training-sdk/openapitools.json (423 bytes)
CREATE training-sdk/package.json (4283 bytes)
√ Packages installed successfully.`;
}
