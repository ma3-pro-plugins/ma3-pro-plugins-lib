import { StringUtils } from './StringUtils';

// Don't import this from Utils to avoid an import loop
function objectKeys<K extends string | symbol | number>(t: {
  [J in K]?: any;
}): K[] {
  const keys: K[] = [];
  for (let [k, _v] of pairs(t)) {
    keys.push(k);
  }
  return keys;
}

const INDENT = '  ';
export function objToString(obj: object, indent: number = 0, multiline: boolean = true): string {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return `[${(obj as any[]).map((elm) => objToString(elm, indent)).join(',')}]`;
    } else {
      let s = '';
      if (objectKeys(obj).length === 0) {
        s = `{}`;
      } else {
        const keyPrefix1 = StringUtils.repeat(INDENT, indent + 1);
        const keyPrefix2 = StringUtils.repeat(INDENT, indent + 2);
        // s += `\n${keyPrefix1}{\n`
        s += '\n';
        for (let [k, v] of pairs(obj)) {
          let keyStr;
          if (typeof k !== 'number') {
            keyStr = `"${k}"`;
          }
          s += `${keyPrefix2}${keyStr} = ${objToString(v, indent + 2)}\n`;
        }
        // s += `${keyPrefix1}}`
      }
      return s;
    }
  } else {
    return typeof obj === 'string' ? `"${obj}"` : tostring(obj);
  }
}

export const DebugUtils = {
  objToString,
};
