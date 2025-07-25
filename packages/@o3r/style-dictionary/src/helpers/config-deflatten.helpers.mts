const merge = (base: any, item: any): any => {
  if (base === undefined || base === null) {
    return item;
  }
  if (typeof base !== 'object') {
    if (item !== null && item !== undefined) {
      throw new Error(`Fail to merge ${item} to ${base}`);
    }
    return item ?? base;
  }
  return Array.isArray(base)
    ? [
      ...base,
      ...item
    ]
    : {
      ...item,
      ...Object.fromEntries(Object.entries(base)
        .map(([name, value]) => ([name, merge(value, item[name])]))
      )
    };
};

export const deflatten = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((i) => deflatten(i));
  }

  return Object.entries(obj)
    .reduce((acc, [key, value]) => {
      const [first, ...tail] = key.split('.');
      key = first;
      if (tail.length > 0) {
        value = tail
          .reverse()
          .reduce((node, k) => ({ [k]: node }), value);
      }
      acc[key] = merge(acc[key], deflatten(value));
      return acc;
    }, {} as Record<string, any>);
};
