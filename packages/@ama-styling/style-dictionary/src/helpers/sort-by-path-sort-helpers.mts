import type {
  TransformedToken,
} from 'style-dictionary/types';

/**
 * Sort the Token based on Path
 * @param tokenA
 * @param tokenB
 */
export const sortByPath = (tokenA: TransformedToken, tokenB: TransformedToken) => {
  const arraySize = Math.max(tokenB.path.length, tokenA.path.length);
  let i = 0;
  let result: 0 | 1 | -1 = 0;
  while (i < arraySize && result === 0) {
    const nodeA = tokenA.path[i];
    const nodeB = tokenB.path[i];
    if (nodeB === undefined) {
      result = 1;
    } else if (nodeA === undefined) {
      result = -1;
    } else {
      const nodeNumberA = Number.parseInt(nodeA, 10);
      const nodeNumberB = Number.parseInt(nodeB, 10);
      if (Number.isNaN(nodeNumberA) || Number.isNaN(nodeNumberB)) {
        result = nodeB === nodeA ? 0 : (nodeB > nodeA ? -1 : 1);
      } else {
        result = nodeNumberB === nodeNumberA ? 0 : (nodeNumberB > nodeNumberA ? -1 : 1);
      }
    }
    i++;
  }

  return result;
};
