export function traverseDOMTree(
  node: Node,
  options: { enter: (node: Node) => void; exit: (node: Node) => void }
) {
  options.enter(node);
  node.childNodes.forEach((node) => traverseDOMTree(node, options));
  options.exit(node);
}
