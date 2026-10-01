import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
async function walk(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(item=>item.isDirectory()?walk(join(dir,item.name)):join(dir,item.name)))).flat();}
const files=await walk('dist');
assert(!files.some(file=>/demo-|hidden-draft|\.wasm$/i.test(file)),'Demo route or parser leaked');
for(const file of files.filter(file=>/\.(html|xml|js|json|css)$/i.test(file))){
 const content=await readFile(file,'utf8');
 assert(!/demo-project|demo-math-and-markdown|demo-code-tools|demo-article-series|draft sentinel|Test article:|Test project:/i.test(content),`Demo content leaked: ${file}`);
}
console.log('Verified production artifacts exclude demo routes/content, feeds/indexes, and build-time parser.');
