type XmlNode = XmlNode[] & {
  label: string;
  xarg: { [key: string]: string };
};
export function collect(xml: string): XmlNode;
