// TODO remove when we only support from Node 24
export const sanitizeVariable = (variable) => typeof RegExp.escape === 'function'
  ? RegExp.escape(variable)
  : variable.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
