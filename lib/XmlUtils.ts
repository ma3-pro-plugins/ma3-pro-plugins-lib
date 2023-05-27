import { collect, XmlNode } from './parseXml';

function dumpXmlNode(node: XmlNode) {
  Printf('label:' + tostring(node.label));
  if (node.xarg !== undefined) {
    Printf('xarg: ');
    for (const [k, v] of pairs(node.xarg)) {
      Printf('  [' + tostring(k) + ': ' + tostring(v) + ']');
    }
  }
  for (const child of node) {
    dumpXmlNode(child);
  }
}

export const XmlUtils = {
  parseXml: collect,
  dumpXmlNode,
};
