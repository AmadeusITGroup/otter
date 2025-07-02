import {
  O3rJsonOrStringPipe,
} from './json-or-string.pipe';

describe('O3rJsonOrStringPipe', () => {
  it('should not escape " in string', () => {
    const pipe = new O3rJsonOrStringPipe();
    const myString = `This "string" should not be escaped`;
    expect(pipe.transform(myString)).toBe(myString);
  });
  it('should stringify json objects', () => {
    const pipe = new O3rJsonOrStringPipe();
    const myObject = { a: { b: 1 }, c: { d: 'e' }, f: ['1', 2] };
    expect(pipe.transform(myObject)).toEqual(`{
  "a": {
    "b": 1
  },
  "c": {
    "d": "e"
  },
  "f": [
    "1",
    2
  ]
}`);
  });
});
