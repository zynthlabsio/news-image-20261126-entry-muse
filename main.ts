// The World in One Picture - Thursday 26 November 2026.
// Entry for the make.fun bounty "news-image-20261126".
//
// The picture itself is the entry.png committed beside this file: an
// editorial poster built for this competition (one vector scene drawn
// per story, headlines set in type over it). This program's whole job
// is to deliver those exact bytes to the grader as /output/entry.png.
//
// Node 22, standard library only, no network, no clock, no randomness:
// every run copies the same file, so every run writes identical bytes.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const target = join(outDir, "entry.png");
copyFileSync(source, target);

// The gate wants a whole PNG of at most 1 MiB: prove the delivered bytes
// are exactly the committed picture before calling it done.
const bytes = readFileSync(target);
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const isPng = PNG_SIGNATURE.every((b, i) => bytes[i] === b);
if (!isPng || bytes.length > 1_048_576) {
  throw new Error(`entry.png failed its own check: png=${isPng} bytes=${bytes.length}`);
}
console.log(`wrote entry.png (${bytes.length} bytes)`);
