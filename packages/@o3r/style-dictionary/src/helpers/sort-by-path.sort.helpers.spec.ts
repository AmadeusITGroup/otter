import type {
  TransformedToken,
} from 'style-dictionary/types';
import {
  sortByPath,
} from './sort-by-path.sort.helpers.mjs';

describe('sortByPath', () => {
  it('should sort in alphabetic order', () => {
    const tokens = [
      {
        name: 'my.var.z',
        path: ['my', 'var', 'z']
      },
      {
        name: 'my.var.a',
        path: ['my', 'var', 'a']
      }
    ] as TransformedToken[];

    const res = tokens.sort(sortByPath);
    expect(res.length).toBe(2);
    expect(res[0].name).toBe('my.var.a');
    expect(res[1].name).toBe('my.var.z');
  });

  it('should sort in alphabetic order and start with shorter', () => {
    const tokens = [
      {
        name: 'my.var.z',
        path: ['my', 'var', 'z']
      },
      {
        name: 'my.var.a',
        path: ['my', 'var', 'a']
      },
      {
        name: 'my.var',
        path: ['my', 'var']
      }
    ] as TransformedToken[];

    const res = tokens.sort(sortByPath);
    expect(res.length).toBe(3);
    expect(res[0].name).toBe('my.var');
    expect(res[1].name).toBe('my.var.a');
    expect(res[2].name).toBe('my.var.z');
  });

  it('should sort in numeric order', () => {
    const tokens = [
      {
        name: 'my.var.90',
        path: ['my', 'var', '90']
      },
      {
        name: 'my.var.00',
        path: ['my', 'var', '00']
      },
      {
        name: 'my.var.1',
        path: ['my', 'var', '1']
      },
      {
        name: 'my.var',
        path: ['my', 'var']
      }
    ] as TransformedToken[];

    const res = tokens.sort(sortByPath);
    expect(res.length).toBe(4);
    expect(res[0].name).toBe('my.var');
    expect(res[1].name).toBe('my.var.00');
    expect(res[2].name).toBe('my.var.1');
    expect(res[3].name).toBe('my.var.90');
  });

  it('should sort in mix alphabetical-numeric order', () => {
    const tokens = [
      {
        name: 'my.var.90',
        path: ['my', 'var', '90']
      },
      {
        name: 'my.var.a',
        path: ['my', 'var', 'a']
      },
      {
        name: 'my.var.00',
        path: ['my', 'var', '00']
      },
      {
        name: 'my.var',
        path: ['my', 'var']
      }
    ] as TransformedToken[];

    const res = tokens.sort(sortByPath);
    expect(res.length).toBe(4);
    expect(res[0].name).toBe('my.var');
    expect(res[1].name).toBe('my.var.00');
    expect(res[2].name).toBe('my.var.90');
    expect(res[3].name).toBe('my.var.a');
  });
});
