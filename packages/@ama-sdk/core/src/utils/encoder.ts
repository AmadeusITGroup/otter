// The content of this file is inspired from https://github.com/inexorabletash/text-encoding/blob/master/lib/encoding.js
// in order to support UTF8 strings encoding in case TextEncoder is not available

/**
 * Represents a byte stream to be processed by and Encoder
 */
class Stream {
  public static readonly END_OF_STREAM = -1;

  private readonly tokens: number[];

  constructor(tokens: Uint8Array | number[]) {
    this.tokens = Array.prototype.slice.call(tokens);
    // Reversed as push/pop is more efficient than shift/unshift.
    this.tokens.reverse();
  }

  /**
   * @returns True if end-of-stream has been hit.
   */
  public get endOfStream() {
    return this.tokens.length === 0;
  }

  /**
   * When a token is read from a stream, the first token in the
   * stream must be returned and subsequently removed, and
   * end-of-stream must be returned otherwise.
   * @returns Get the next token from the stream, or
   * end_of_stream.
   */
  public read() {
    if (this.tokens.length === 0) {
      return Stream.END_OF_STREAM;
    }
    return this.tokens.pop();
  }

  /**
   * When one or more tokens are prepended to a stream, those tokens
   * must be inserted, in given order, before the first token in the
   * stream.
   * @param token The token(s) to prepend to the
   * stream.
   */
  public prepend(token: number | number[]) {
    if (Array.isArray(token)) {
      while (token.length > 0) {
        this.tokens.push(token.pop()!);
      }
    } else {
      this.tokens.push(token);
    }
  }

  /**
   * When one or more tokens are pushed to a stream, those tokens
   * must be inserted, in given order, after the last token in the
   * stream.
   * @param token The tokens(s) to push to the
   * stream.
   */
  public push(token: number | number[]) {
    if (Array.isArray(token)) {
      while (token.length > 0) {
        this.tokens.unshift(token.shift()!);
      }
    } else {
      this.tokens.unshift(token);
    }
  }
}

/**
 * Returns the byte equivalent given a string
 * @param string Input string of UTF-16 code units.
 * @param s
 * @returns Code points.
 */
function stringToCodePoints(s: string) {
  // https://heycam.github.io/webidl/#dfn-obtain-unicode

  // 1. Let S be the DOMString value.
  // 2. Let n be the length of S.
  const n = s.length;
  // 3. Initialize i to 0.
  let i = 0;
  // 4. Initialize U to be an empty sequence of Unicode characters.
  const u = [];

  // 5. While i < n:
  while (i < n) {
    // 1. Let c be the code unit in S at index i.
    const c = s.charCodeAt(i);

    // 2. Depending on the value of c:

    // c < 0xD800 or c > 0xDFFF
    if (c < 0xD8_00 || c > 0xDF_FF) {
      // Append to U the Unicode character with code point c.
      u.push(c);
    }

    // 0xDC00 ≤ c ≤ 0xDFFF
    else if (0xDC_00 <= c && c <= 0xDF_FF) {
      // Append to U a U+FFFD REPLACEMENT CHARACTER.
      u.push(0xFF_FD);
    }

    // 0xD800 ≤ c ≤ 0xDBFF
    else if (0xD8_00 <= c && c <= 0xDB_FF) {
      // 1. If i = n−1, then append to U a U+FFFD REPLACEMENT
      // CHARACTER.
      if (i === n - 1) {
        u.push(0xFF_FD);
      }
      // 2. Otherwise, i < n−1:
      else {
        // 1. Let d be the code unit in S at index i+1.
        const d = s.charCodeAt(i + 1);

        // 2. If 0xDC00 ≤ d ≤ 0xDFFF, then:
        if (0xDC_00 <= d && d <= 0xDF_FF) {
          // 1. Let a be c & 0x3FF.
          // eslint-disable-next-line no-bitwise
          const a = c & 0x3_FF;

          // 2. Let b be d & 0x3FF.
          // eslint-disable-next-line no-bitwise
          const b = d & 0x3_FF;

          // 3. Append to U the Unicode character with code point
          // 2^16+2^10*a+b.
          // eslint-disable-next-line no-bitwise
          u.push(0x1_00_00 + (a << 10) + b);

          // 4. Set i to i+1.
          i += 1;
        }

        // 3. Otherwise, d < 0xDC00 or d > 0xDFFF. Append to U a
        // U+FFFD REPLACEMENT CHARACTER.
        else {
          u.push(0xFF_FD);
        }
      }
    }

    // 3. Set i to i+1.
    i += 1;
  }

  // 6. Return U.
  return u;
}

/**
 * Alternative to TextEncoder for browsers that do not support it.
 */
export class Encoder {
  public static readonly FINISHED = -1;

  constructor() {}

  /**
   * An ASCII byte is a byte in the range 0x00 to 0x7F, inclusive.
   * @param a The number to test.
   * @returns True if a is in the range 0x00 to 0x7F, inclusive.
   */
  private isASCIIByte(a: number) {
    return 0x00 <= a && a <= 0x7F;
  }

  /**
   * @param a The number to test.
   * @param min The minimum value in the range, inclusive.
   * @param max The maximum value in the range, inclusive.
   * @returns {boolean} True if a >= min and a <= max.
   */
  private inRange(a: number, min: number, max: number) {
    return min <= a && a <= max;
  }

  private handler(codePoint: number) {
    // 1. If code point is end-of-stream, return finished.
    if (codePoint === Stream.END_OF_STREAM) {
      return Encoder.FINISHED;
    }

    // 2. If code point is an ASCII code point, return a byte whose
    // value is code point.
    if (this.isASCIIByte(codePoint)) {
      return codePoint;
    }

    // 3. Set count and offset based on the range code point is in:
    let count = 1;
    let offset = 0xC0;
    // U+0080 to U+07FF, inclusive:

    // U+0800 to U+FFFF, inclusive:
    if (this.inRange(codePoint, 0x08_00, 0xFF_FF)) {
      // 2 and 0xE0
      count = 2;
      offset = 0xE0;
    }
    // U+10000 to U+10FFFF, inclusive:
    else if (this.inRange(codePoint, 0x1_00_00, 0x10_FF_FF)) {
      // 3 and 0xF0
      count = 3;
      offset = 0xF0;
    }

    // 4. Let bytes be a byte sequence whose first byte is (code
    // point >> (6 × count)) + offset.
    // eslint-disable-next-line no-bitwise
    const bytes = [(codePoint >> (6 * count)) + offset];

    // 5. Run these substeps while count is greater than 0:
    while (count > 0) {
      // 1. Set temp to code point >> (6 × (count − 1)).
      // eslint-disable-next-line no-bitwise
      const temp = codePoint >> (6 * (count - 1));

      // 2. Append to bytes 0x80 | (temp & 0x3F).
      // eslint-disable-next-line no-bitwise
      bytes.push(0x80 | (temp & 0x3F));

      // 3. Decrease count by one.
      count -= 1;
    }

    // 6. Return bytes bytes, in order.
    return bytes;
  }

  public encode(str: string): Uint8Array {
    // 1. Convert input to a stream.
    const input = new Stream(stringToCodePoints(str));
    // 2. Let output be a new stream
    const output = [];

    let result: number | number[];
    // 3. While true, run these substeps:

    while (true) {
      // 1. Let token be the result of reading from input.
      const token = input.read();
      if (token === Stream.END_OF_STREAM) {
        break;
      }
      // 2. Let result be the result of processing token for encoder,
      // input, output.
      result = this.handler(token!);
      if (result === Encoder.FINISHED) {
        break;
      }
      if (Array.isArray(result)) {
        output.push(...result);
      } else {
        output.push(result);
      }
    }

    // 3. If result is finished, convert output into a byte sequence,
    // and then return a Uint8Array object wrapping an ArrayBuffer
    // containing output.
    return new Uint8Array(output);
  }
}
