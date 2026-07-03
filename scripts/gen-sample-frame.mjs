import { readFileSync, writeFileSync } from 'node:fs';

const b = readFileSync('media/frame.png');
const width = b.readUInt32BE(16);
const height = b.readUInt32BE(20);
const b64 = b.toString('base64');

const ts = `// Auto-generated sample frame PNG (base64) used only by the demo harness.
/* eslint-disable */
const BASE64 =
  '${b64}';

function decode(): Uint8Array {
  const bin = atob(BASE64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const SAMPLE_FRAME_BYTES = decode();
export const SAMPLE_FRAME_WIDTH = ${width};
export const SAMPLE_FRAME_HEIGHT = ${height};
`;

writeFileSync('src/demo/sampleFrame.ts', ts);
console.log('wrote src/demo/sampleFrame.ts', { width, height, bytes: b.length });
