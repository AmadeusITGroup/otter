import type {
  ParamSerialization,
} from '../../fwk';
import {
  AdditionalParamsRequest,
} from '../additional-params';
import {
  RequestPlugin,
} from '../core';

/**
 * Plugin to send the SI Tokens with the request
 */
export class SiTokenRequest extends AdditionalParamsRequest implements RequestPlugin {
  /** SI Token */
  public siToken?: string;

  /** SI Token 2 */
  public siToken2?: string;

  /**
   * Amadeus SI Token plugin
   * The SI Tokens are mandatory to target Back-end protected by Amadeus LSS.
   * You can find more details on SI Tokens on http://si-wiki/SI/tikiwiki/tiki-index.php?page=HTTP+GUIs%3A+Amadeus+as+server
   * @param siToken  SI Token
   * @param siToken2 SI Token 2
   */
  constructor(siToken?: string, siToken2?: string) {
    super({
      queryParams: (queryParams?: { [key: string]: string }) => {
        const ret = queryParams || {};
        if (this.siToken) {
          ret.SITK = this.siToken;
        }
        if (this.siToken2) {
          ret.SITK2 = this.siToken2;
        }
        return ret;
      },
      queryParameters: (queryParameters?: { [key: string]: ParamSerialization }) => {
        const ret = queryParameters || {};
        if (this.siToken) {
          ret.SITK = ret.SITK
            ? { ...ret.SITK, value: this.siToken }
            : { value: this.siToken, exploded: true, style: 'form' };
        }
        if (this.siToken2) {
          ret.SITK2 = ret.SITK2
            ? { ...ret.SITK2, value: this.siToken2 }
            : { value: this.siToken2, exploded: true, style: 'form' };
        }
        return ret;
      }
    });
    this.siToken = siToken;
    this.siToken2 = siToken2;
  }
}
