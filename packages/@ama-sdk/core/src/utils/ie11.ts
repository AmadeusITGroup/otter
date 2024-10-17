interface CryptoFunctionOutput<T> {
  oncomplete: (e: {target: {result: T}}) => unknown;
  onerror: (e: Error) => unknown;
}

type RSAOAEPParams = {name: 'RSA-OAEP'; hash: 'SHA-256'};

export interface MsCrypto {
  msCrypto: {
    getRandomValues: (typedArray: Uint8Array) => Uint8Array;
    subtle: {
      generateKey: (algorithm: {name: string; length: number}, extractable: boolean, keyUsages: string[]) => CryptoFunctionOutput<CryptoKey>;
      encrypt: <Params extends RSAOAEPParams | AesGcmParams>(algorithm: Params, key: CryptoKey, data: Uint8Array) =>
      CryptoFunctionOutput<typeof algorithm extends AesGcmParams ? {ciphertext: ArrayBuffer; tag: ArrayBuffer} : ArrayBuffer>;
      exportKey: (format: string, key: CryptoKey) => CryptoFunctionOutput<Uint8Array>;
    };
  };
}

/**
 * Promisify window.msCrypto functions
 * @param cryptoOutput Output of the window.msCrypto function
 */
export function promisifyMsCrypto<T>(cryptoOutput: CryptoFunctionOutput<T>) {
  return new Promise<T>((resolve, reject) => {
    cryptoOutput.oncomplete = (e) => resolve(e.target.result);
    cryptoOutput.onerror = (e) => reject(e);
  });
}
