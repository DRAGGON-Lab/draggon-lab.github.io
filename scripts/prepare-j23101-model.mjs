import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const source = process.argv[2];
const output = path.join(root, 'public/molecules/j23101-b-dna.pdb');

if (!source) {
  throw new Error('Usage: node scripts/prepare-j23101-model.mjs /path/to/web-3dna-model.pdb');
}

const sequence = 'TTTACAGCTAGCTCAGTCCTAGGTATTATGCTAGC';
const rawPdb = await fs.readFile(source, 'utf8');
const remarks = [
  'REMARK   1 J23101 PROMOTER IDEALIZED B-DNA MODEL',
  'REMARK   2 GENERATED 2026-08-29 WITH X3DNA-DSSR FIBER MODEL 4',
  'REMARK   3 SOURCE https://web.x3dna-dssr.org/fibermodel',
  `REMARK   4 CHAIN A 5'-${sequence}-3'`,
  'REMARK   5 CHAIN B IS THE ANTIPARALLEL WATSON-CRICK COMPLEMENT',
  'REMARK   6 CANONICAL FIBER PARAMETERS: TWIST 36.0 DEG; RISE 3.375 ANGSTROM',
  'REMARK   7 IDEALIZED MODEL; NOT EXPERIMENTAL OR ENERGY-MINIMIZED',
].join('\n');
const pdb = `${remarks}\n${rawPdb.replace(/^REMARK DSSR\s*\n/, '')}`;
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, pdb);

process.stdout.write(`Prepared ${output}.\n`);
