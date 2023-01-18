import { Buffer } from 'node:buffer';
import { EOL } from 'node:os';

/**
 * Generate an NpmRc minimal to use Otter and Dapi packages
 *
 * @param token Digital For Airlines registry token
 * @param azureToken
 * @returns Content of the .npmrc file
 */
export const generateBasicNpmrc = (azureToken: string) => {
  const azurePatBase64 = Buffer.from(azureToken).toString('base64');
  return [
    '@dxapi-spec:registry=https://pkgs.dev.azure.com/AmadeusDigitalAirline/Orchestration-Engine-API-Spec/_packaging/ac-spec/npm/registry/',
    '//pkgs.dev.azure.com/AmadeusDigitalAirline/Orchestration-Engine-API-Spec/_packaging/ac-spec/npm/registry/:username=AmadeusDigitalAirline',
    `//pkgs.dev.azure.com/AmadeusDigitalAirline/Orchestration-Engine-API-Spec/_packaging/ac-spec/npm/registry/:_password=${azurePatBase64}`,
    '//pkgs.dev.azure.com/AmadeusDigitalAirline/Orchestration-Engine-API-Spec/_packaging/ac-spec/npm/registry/:email=noreply@amadeus.com',
    '//pkgs.dev.azure.com/AmadeusDigitalAirline/Orchestration-Engine-API-Spec/_packaging/ac-spec/npm/registry/:always-auth=true',
    'always-auth=true',
    'package-lock=false'
  ].join(EOL);
};
