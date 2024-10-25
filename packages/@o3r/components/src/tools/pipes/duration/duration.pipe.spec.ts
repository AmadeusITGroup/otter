import {
  DurationPipe,
  O3rDurationPipe
} from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new O3rDurationPipe();
  const deprecatedPipe = new DurationPipe();

  it('transforms 120s to 0:02', () => {
    expect(pipe.transform(120)).toBe('0:02');
    expect(deprecatedPipe.transform(120)).toBe('0:02');
  });

  it('transforms 100s to 0:01', () => {
    expect(pipe.transform(100)).toBe('0:01');
    expect(deprecatedPipe.transform(100)).toBe('0:01');
  });

  it('transforms 3660 seconds to "1:01"', () => {
    expect(pipe.transform(3660)).toBe('1:01');
    expect(deprecatedPipe.transform(3660)).toBe('1:01');
  });

  it('transforms 90000s to "25:00" (duration exceeds 24 hours)', () => {
    expect(pipe.transform(90_000)).toBe('25:00');
    expect(deprecatedPipe.transform(90_000)).toBe('25:00');
  });

  it('transforms 360000s to "100:00" (hours are 3 digits long)', () => {
    expect(pipe.transform(360_000)).toBe('100:00');
    expect(deprecatedPipe.transform(360_000)).toBe('100:00');
  });

  it('transforms 120s to 0h02m', () => {
    expect(pipe.transform(120, '{h}h{mm}m')).toBe('0h02m');
    expect(deprecatedPipe.transform(120, '{h}h{mm}m')).toBe('0h02m');
  });

  it('transforms 120s to 00H02M', () => {
    expect(pipe.transform(120, '{hh}H{mm}M')).toBe('00H02M');
    expect(deprecatedPipe.transform(120, '{hh}H{mm}M')).toBe('00H02M');
  });

  it('transforms 3660s to 1h01', () => {
    expect(pipe.transform(3660, '{h}h{mm}')).toBe('1h01');
    expect(deprecatedPipe.transform(3660, '{h}h{mm}')).toBe('1h01');
  });

  it('transforms 86399s to 0d23h59m', () => {
    expect(pipe.transform(86_399, '{d}d{h}h{mm}m')).toBe('0d23h59m');
    expect(deprecatedPipe.transform(86_399, '{d}d{h}h{mm}m')).toBe('0d23h59m');
  });

  it('transforms 86399s to 0d86399s', () => {
    expect(pipe.transform(86_399, '{d}d{s}s')).toBe('0d86399s');
    expect(deprecatedPipe.transform(86_399, '{d}d{s}s')).toBe('0d86399s');
  });

  it('transforms 93675s to an object "{"d": 1, "h": 2, "m": 1, "s": 15}"', () => {
    expect(pipe.transform(93_675, '{"d": {d}, "h": {h}, "m": {m}, "s": {s}}')).toBe('{"d": 1, "h": 2, "m": 1, "s": 15}');
    expect(deprecatedPipe.transform(93_675, '{"d": {d}, "h": {h}, "m": {m}, "s": {s}}')).toBe('{"d": 1, "h": 2, "m": 1, "s": 15}');
  });

  it('returns pattern when regex not respected', () => {
    expect(pipe.transform(1234, 'hh:mm')).toBe('hh:mm');
    expect(deprecatedPipe.transform(1234, 'hh:mm')).toBe('hh:mm');
  });

  it('should work for custom unit times', () => {
    expect(pipe.transform(5725, '{t}:{k}', [
      {
        formatCharacter: 't',
        divider: 100
      }, {
        formatCharacter: 'k',
        divider: 25
      }
    ])).toBe('57:1');
    expect(deprecatedPipe.transform(5725, '{t}:{k}', [
      {
        formatCharacter: 't',
        divider: 100
      }, {
        formatCharacter: 'k',
        divider: 25
      }
    ])).toBe('57:1');
  });

  it('should work for unit times that are not present in the pattern', () => {
    expect(pipe.transform(5725, '{t}:{k}', [
      {
        formatCharacter: 't',
        divider: 100
      }, {
        formatCharacter: 'o',
        divider: 25
      }, {
        formatCharacter: 'k',
        divider: 1,
        modulo: 25
      }
    ])).toBe('57:0');
    expect(deprecatedPipe.transform(5725, '{t}:{k}', [
      {
        formatCharacter: 't',
        divider: 100
      }, {
        formatCharacter: 'o',
        divider: 25
      }, {
        formatCharacter: 'k',
        divider: 1,
        modulo: 25
      }
    ])).toBe('57:0');
  });
});
