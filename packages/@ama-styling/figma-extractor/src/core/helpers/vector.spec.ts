import {
  vectorToAngle,
} from './vector';

describe('vectorToAngle', () => {
  test('should return the correct angle', () => {
    expect(vectorToAngle([{ x: 45, y: 45 }, { x: 0, y: 180 }])).toBe(198);
  });
});
