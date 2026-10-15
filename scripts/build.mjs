import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const out = join(root, 'dist');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const copy = (from, to = from) => {
  cpSync(join(root, from), join(out, to), { recursive: true });
};

for (const file of ['index.html', '_redirects', '_headers']) {
  copy(file);
}

copy('images');

console.log('Static site copied to dist/');
