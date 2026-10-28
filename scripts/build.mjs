import { mkdir, copyFile, rm } from 'node:fs/promises';
import { publicFiles } from '../server.mjs';

// Export only the public dashboard assets, independent of working directory.
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
for (const file of publicFiles) {
  const destination = new URL(`../dist/${file}`, import.meta.url);
  await mkdir(new URL('./', destination), { recursive: true });
  await copyFile(new URL(`../${file}`, import.meta.url), destination);
}
console.log(`Exported ${publicFiles.length} dashboard assets to dist/.`);
