import {
  deflatten,
} from './config-deflatten.helpers.mjs';

describe('deflatten', () => {
  test('should not touch non-object type', () => {
    expect(deflatten(null)).toBe(null);
    expect(deflatten('a string')).toBe('a string');
    expect(deflatten(123)).toBe(123);
    expect(deflatten(true)).toBe(true);
    expect(deflatten(['a'])).toEqual(['a']);
  });

  test('should not change deep object', () => {
    const object = { a: { b: { c: 'test', d: 123, e: true, f: ['1', '2', '3'] } } };
    expect(deflatten(object)).toEqual(object);
  });

  test('should deflatten unique flatten path', () => {
    const object = { 'a.b': { c: 'test', d: 123, e: true, f: ['1', '2', '3'] } };
    const resultObject = { a: { b: { c: 'test', d: 123, e: true, f: ['1', '2', '3'] } } };
    expect(deflatten(object)).toEqual(resultObject);
  });

  test('should deflatten conflicting flatten path', () => {
    const object = { 'a.b': { c: 'test' }, a: { b: { d: 123, e: true, f: ['1', '2', '3'] } } };
    const resultObject = { a: { b: { c: 'test', d: 123, e: true, f: ['1', '2', '3'] } } };
    expect(deflatten(object)).toEqual(resultObject);
  });

  test('should deflatten with flatten path within object', () => {
    const object = { 'a.b': { c: 'test' }, a: { b: { d: 123, e: true, f: [{ 'g.h': { i: 'value' } }] } } };
    const resultObject = { a: { b: { c: 'test', d: 123, e: true, f: [{ g: { h: { i: 'value' } } }] } } };
    expect(deflatten(object)).toEqual(resultObject);
  });

  test('should throw in case of conflict', () => {
    const object = { 'a.b': 'test', a: { b: 'other value' } };
    expect(() => deflatten(object)).toThrow();
  });
});
