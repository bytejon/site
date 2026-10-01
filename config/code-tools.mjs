import { h } from '@expressive-code/core/hast';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { luauFolds } from './luau-folds.mjs';
const blocks = new WeakMap();
function find(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children || []) { const result = find(child, predicate); if (result) return result; }
}
export function pluginCodeTools() {
  return {
    name: 'Jon code tools',
    jsModules: [readFileSync(new URL('./code-tools-browser.js',import.meta.url),'utf8')],
    hooks: {
      preprocessMetadata: ({ codeBlock, addGutterElement }) => {
        if (codeBlock.language !== 'luau') return;
        addGutterElement({
          renderPhase: 'later',
          renderLine: ({ lineIndex }) => {
            const data = blocks.get(codeBlock), fold = data?.folds.find(fold => fold.start === lineIndex + 1);
            if (!fold) return h('span.scope-placeholder',{ 'aria-hidden': 'true' });
            return h('button.scope-toggle',{
              type: 'button', 'aria-expanded': 'true',
              'aria-label': `Collapse ${fold.kind} scope at line ${fold.start}`,
              'aria-controls': Array.from({length:fold.end-fold.start-1},(_,index)=>`${data.id}-${fold.start+index+1}`).join(' '),
              'data-fold-start': fold.start, 'data-fold-end': fold.end, 'data-fold-kind': fold.kind,
            },h('svg',{viewBox:'0 0 24 24',width:14,height:14,fill:'none',stroke:'currentColor','stroke-width':1.6,'aria-hidden':'true'},h('path',{d:'m6 9 6 6 6-6'})));
          },
          renderPlaceholder: () => h('span.scope-placeholder',{'aria-hidden':'true'}),
        });
      },
      preprocessCode: async ({ codeBlock }) => {
        const ranges = codeBlock.language === 'luau' ? await luauFolds(codeBlock.code) : { folds: [], supported: false };
        blocks.set(codeBlock,{...ranges,id:`code-${randomUUID()}`});
      },
      postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
        renderData.lineAst.properties['data-code-line'] = lineIndex + 1;
        renderData.lineAst.properties.id = `${blocks.get(codeBlock).id}-${lineIndex+1}`;
      },
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const frame = renderData.blockAst;
        const data = blocks.get(codeBlock);
        frame.properties.className = [...(frame.properties.className || []),'has-toolbar'];
        frame.properties['data-code-tools'] = '';
        frame.properties['data-fold-supported'] = String(codeBlock.language === 'luau' && data.supported);
        const header = find(frame,node => node.tagName === 'figcaption');
        if (!header) return;
        header.properties.className = [...(header.properties.className || []),'code-toolbar'];
        const language = h('span.code-language',{'aria-label':`Language: ${codeBlock.language}`},codeBlock.language);
        header.children.push(language);
        if (data.folds.length) header.children.push(h('button.expand-scopes',{type:'button','aria-label':'Expand all code scopes'},'Expand all'));
        const copy = frame.children.find(node => node.type === 'element' && node.properties.className?.includes('copy'));
        if (copy) { frame.children = frame.children.filter(node => node !== copy); header.children.push(copy); }
      },
    },
  };
}
