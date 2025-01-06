import crypto from 'node:crypto';
import {
  base64DecodeUrl,
  createBase64Decoder,
  createBase64Encoder,
  createBase64UrlDecoder,
  createBase64UrlEncoder,
  createJweEncoder,
} from './json-token';

describe('JSON token utils', () => {
  it('should encode and decode in base64 properly a string that contains characters occupying more than 1 byte', () => {
    const base64Encoder = createBase64Encoder();
    const base64Decoder = createBase64Decoder();

    const myString = '☸☹☺☻☼☾☿';
    const converted = base64Encoder(myString);
    const original = base64Decoder(converted);

    expect(original).toEqual(myString);
  });

  it('should encode and decode in base64Url properly a string that contains characters occupying more than 1 byte', () => {
    const base64UrlEncoder = createBase64UrlEncoder();
    const base64UrlDecoder = createBase64UrlDecoder();

    const myString = '☸☹☺☻☼☾☿';
    const converted = base64UrlEncoder(myString);
    const original = base64UrlDecoder(converted);

    expect(original).toEqual(myString);
  });
});

describe('JSON Web Encryption Token', () => {
  it('should generate a proper JWE Token', async () => {
    const expectedJwePayload = {
      iat: 0,
      exp: 3600,
      iss: 'DEMO_JWE',
      sub: 'pii',
      'ama-tokens': {
        '{orderId}': 'RG287F',
        '{lastName}': 'Doe'
      }
    };
    const expectedJweHeader = {
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM',
      typ: 'JWE',
      kid: 'TEST',
      iss: 'DEMO_JWE',
      sub: 'pii'
    };

    const expectedIv = new Uint8Array([21, 214, 56, 246, 25, 105, 77, 119, 182, 205, 77, 245]);
    const cek = new Uint8Array([247, 35, 44, 202, 131, 97, 211, 246, 244, 124, 103, 84, 189, 120, 172, 170, 207, 181, 26, 179, 11, 94, 23, 252, 252, 68, 55, 215, 250, 132, 167, 206]);

    /* eslint-disable @stylistic/max-len -- keep the buffer on the same line */
    const expectedJweEncryptedKey = new Uint8Array([37, 70, 170, 164, 178, 219, 174, 171, 41, 250, 254, 108, 183, 65, 233, 204, 14, 227, 187, 199, 54, 14, 72, 177, 223, 129, 9, 222, 38, 58, 184, 136, 82, 241, 61, 34, 126, 105, 106, 229, 183, 51, 147, 94, 152, 255, 20, 81, 122, 84, 150, 65, 189, 198, 38, 16, 134, 100, 213, 27, 132, 63, 190, 150, 171, 188, 122, 28, 28, 206, 178, 190, 100, 220, 239, 25, 172, 209, 239, 148, 161, 164, 131, 18, 184, 163, 35, 112, 77, 144, 67, 8, 151, 0, 157, 162, 162, 46, 181, 83, 203, 129, 167, 59, 254, 85, 58, 165, 148, 126, 32, 76, 77, 248, 134, 241, 21, 13, 66, 10, 100, 255, 185, 149, 80, 180, 173, 151, 124, 147, 211, 148, 110, 16, 232, 90, 70, 4, 155, 59, 141, 132, 19, 66, 148, 187, 232, 67, 145, 164, 254, 17, 175, 219, 77, 255, 233, 67, 188, 32, 215, 65, 60, 111, 29, 92, 117, 94, 10, 179, 214, 39, 44, 118, 18, 62, 74, 236, 88, 3, 24, 42, 81, 85, 87, 165, 116, 139, 245, 230, 66, 245, 12, 182, 211, 13, 17, 148, 221, 87, 0, 44, 229, 106, 31, 6, 206, 81, 185, 149, 101, 115, 244, 123, 26, 81, 177, 22, 183, 49, 153, 226, 120, 87, 58, 156, 133, 189, 134, 144, 77, 30, 20, 9, 171, 212, 253, 79, 177, 34, 200, 127, 236, 153, 179, 249, 204, 19, 240, 175, 2, 147, 158, 47, 239, 108]);

    const outputAesGcm = new Uint8Array([179, 46, 131, 35, 83, 219, 214, 127, 56, 159, 140, 140, 140, 49, 182, 43, 246, 215, 71, 91, 178, 97, 151, 245, 65, 187, 218, 196, 140, 86, 60, 224, 80, 214, 52, 12, 174, 146, 238, 89, 22, 224, 29, 221, 213, 246, 253, 35, 122, 21, 151, 96, 240, 179, 237, 93, 75, 247, 101, 165, 43, 74, 179, 212, 165, 223, 137, 70, 249, 80, 60, 217, 54, 216, 19, 241, 212, 103, 188, 157, 186, 144, 235, 79, 162, 188, 8, 77, 173, 65, 216, 160, 59, 184, 122, 119, 78, 91, 140, 135, 6, 139, 178, 11, 135, 141, 193, 214, 171, 208, 137, 20, 236, 129, 126, 8]);
    /* eslint-enable @stylistic/max-len */

    (global as any).window = {
      btoa: (data: string) => Buffer.from(data, 'ascii').toString('base64'),
      crypto: {
        getRandomValues: jest.fn().mockReturnValue(expectedIv),
        subtle: {
          wrapKey: jest.fn().mockReturnValue(expectedJweEncryptedKey),
          generateKey: jest.fn().mockReturnValue(cek),
          encrypt: jest.fn().mockReturnValue(outputAesGcm)
        }
      }
    };

    const jweToken = await createJweEncoder(96)({ publicKey: 'myPublicKey' as any, keyId: 'TEST' }, expectedJwePayload, ['iss', 'sub']);

    (global as any).window = undefined;

    const [jweHeader, jweEncryptedKey, iv, cipherContent, authenticationTag] = jweToken.split('.');

    expect(decodeURI(Buffer.from(base64DecodeUrl(jweHeader), 'base64').toString())).toEqual(JSON.stringify(expectedJweHeader));
    expect(Buffer.from(base64DecodeUrl(jweEncryptedKey), 'base64')).toEqual(Buffer.from(expectedJweEncryptedKey));
    expect(Buffer.from(base64DecodeUrl(iv), 'base64')).toEqual(Buffer.from(expectedIv));

    const decipher = crypto.createDecipheriv('aes-256-gcm', cek, Buffer.from(base64DecodeUrl(iv), 'base64'), { authTagLength: 12 });
    decipher.setAuthTag(Buffer.from(base64DecodeUrl(authenticationTag), 'base64'));
    let decrypted = decipher.update(Buffer.from(base64DecodeUrl((cipherContent)), 'base64')).toString();
    decrypted += decipher.final().toString();

    expect(decrypted).toEqual(JSON.stringify(expectedJwePayload));
  });
});
