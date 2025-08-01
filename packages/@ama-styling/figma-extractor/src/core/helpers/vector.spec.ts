import {
  vectorToAngle,
} from './vector';

describe('vectorToAngle', () => {
  test('should return the correct angle', () => {
    expect(vectorToAngle([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(135);
    expect(vectorToAngle([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(90);
    expect(vectorToAngle([{ x: 0, y: 0 }, { x: 0, y: 1 }])).toBe(180);
    expect(vectorToAngle([{ x: 0, y: 0 }, { x: -1, y: 0 }])).toBe(270);
    expect(vectorToAngle([{ x: 0, y: 0 }, { x: 0, y: -1 }])).toBe(0);
  });
});
