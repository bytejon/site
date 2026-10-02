import { resolve } from 'node:path';
import { Parser, Language } from 'web-tree-sitter';
import { readFileSync } from 'node:fs';
let ready;
async function language() {
  ready ||= (async () => {
    await Parser.init();
    return Language.load(readFileSync(resolve(process.cwd(), 'vendor/luau-folding/tree-sitter-luau.wasm')));
  })();
  return ready;
}
const scopeTypes = new Map([
  ['function_declaration','function'], ['function_definition','function'],
  ['if_statement','if'], ['for_statement','for'], ['for_in_statement','for'],
  ['while_statement','while'], ['do_statement','do'], ['repeat_statement','repeat'],
  ['table_constructor','table'], ['table_type','table type'], ['object_type','table type'],
]);
export async function luauFolds(code) {
  if (code.length > 100_000) return { folds: [], supported: false, reason: 'Snippet exceeds parsing limit' };
  const grammar = await language();
  const parser = new Parser(); parser.setLanguage(grammar);
  const tree = parser.parse(code);
  try {
    if (!tree || tree.rootNode.hasError) return { folds: [], supported: false, reason: 'Snippet is incomplete or uses unsupported Luau syntax' };
    const folds = [];
    function walk(node) {
      const kind = scopeTypes.get(node.type);
      const start = node.startPosition.row + 1, end = node.endPosition.row + 1;
      if (kind && end > start + 1 && !folds.some(fold => fold.start === start && fold.end === end)) folds.push({ start, end, kind });
      node.namedChildren.forEach(walk);
    }
    walk(tree.rootNode);
    folds.sort((a,b) => a.start - b.start || b.end - a.end);
    // One gutter control per opening line. Prefer the enclosing scope on a shared line.
    return { folds: folds.filter((fold,index) => index === 0 || folds[index - 1].start !== fold.start), supported: true };
  } finally { tree?.delete(); parser.delete(); }
}
