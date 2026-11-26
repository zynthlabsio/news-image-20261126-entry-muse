// The World in One Picture - Thursday 26 November 2026.
// Entry for the make.fun bounty "news-image-20261126".
//
// The picture itself is the entry.png committed beside this file: an
// editorial poster built for this competition (one vector scene drawn
// per story, headlines set in type over it). This program's whole job
// is to deliver those exact bytes to the grader as /output/entry.png,
// and to prove the delivery is intact before calling it done.
//
// Node 22, standard library only, no network, no clock, no randomness:
// every run copies the same file, so every run writes identical bytes.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
if (!isPng) {
  console.error("FAIL: delivered file does not start with the PNG signature");
  process.exit(1);
}
if (bytes.length > 1_048_576) {
  console.error(`FAIL: delivered file is ${bytes.length} bytes, over the 1 MiB gate`);
  process.exit(1);
}

// The poster is a square 1024x1024 canvas: the IHDR chunk carries the
// width and height as big-endian uint32s at bytes 16-24, right after the
// signature and the IHDR length/type fields. Verify them too, so a
// truncated or swapped image cannot pass on signature alone.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  console.error(`FAIL: delivered PNG is ${width}x${height}, expected 1024x1024`);
  process.exit(1);
}

// Finally, prove the copy itself was faithful: read the source picture
// back and compare it with the delivered bytes, length and SHA-256 and
// byte for byte. A short write, a swapped file or a corrupted copy must
// fail loudly here rather than deliver the wrong picture as a pass.
const sourceBytes = readFileSync(source);
const sourceSha256 = createHash("sha256").update(sourceBytes).digest("hex");
const sha256 = createHash("sha256").update(bytes).digest("hex");
if (sourceBytes.length !== bytes.length || sourceSha256 !== sha256 || !bytes.equals(sourceBytes)) {
  console.error(
    `FAIL: delivered bytes differ from the source entry.png ` +
    `(source ${sourceBytes.length} bytes sha256 ${sourceSha256}; ` +
    `delivered ${bytes.length} bytes sha256 ${sha256})`
  );
  process.exit(1);
}
console.log(`PASS entry.png ${bytes.length} bytes ${width}x${height} sha256 ${sha256}`);
