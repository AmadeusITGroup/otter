/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';

export const HOST_ORIGIN = new InjectionToken<string>('HOST_ORIGIN');

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private readonly _messages$ = new Subject<string>();
  private _port: MessagePort | null = null;
  private readonly _hostOrigin = inject(HOST_ORIGIN);

  constructor() {
    const handshakeListener = (event: MessageEvent) => {
      const { origin, data, ports } = event;

      // doing handshake with parent
      if (this._hostOrigin === origin && data === 'handshake') {
        console.log('MF: origin is expected, message is handshake');

        const [port] = ports;
        console.log('MF: Sending handshake back to parent.');
        port.postMessage('handshake');
        window.removeEventListener('message', handshakeListener);

        this._port = port;
        this._port.onmessage = ({ data: _data }) => this._messages$.next(_data);
      }
    };
    window.addEventListener('message', handshakeListener);
  }

  send(message: string) {
    console.log(`MF: sending message to ${this._hostOrigin}:`, message);
    // TODO: wait until handshake is done or queue messages
    this._port!.postMessage(message);
  }

  get messages$() {
    return this._messages$;
  }
}
