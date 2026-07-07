import {
  getAngleWithScreenYAxis,
} from './vector';

describe('getAngleWithScreenYAxis', () => {
  test('should return the correct angle', () => {
    expect(getAngleWithScreenYAxis([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(135);
    expect(getAngleWithScreenYAxis([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(90);
    expect(getAngleWithScreenYAxis([{ x: 0, y: 0 }, { x: 0, y: 1 }])).toBe(180);
    expect(getAngleWithScreenYAxis([{ x: 0, y: 0 }, { x: -1, y: 0 }])).toBe(270);
    expect(getAngleWithScreenYAxis([{ x: 0, y: 0 }, { x: 0, y: -1 }])).toBe(0);
  });
});
