import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const pdbPath = path.resolve('public/molecules/j23101-b-dna.pdb');
const pdb = fs.readFileSync(pdbPath, 'utf8');
const expected = 'TTTACAGCTAGCTCAGTCCTAGGTATTATGCTAGC';
const complement = { A: 'T', C: 'G', G: 'C', T: 'A' };
const expectedAntiparallel = [...expected].map((base) => complement[base]).join('');
const expectedChainB5to3 = [...expectedAntiparallel].reverse().join('');

assert.match(pdb, /GENERATED 2026-08-29 WITH X3DNA-DSSR FIBER MODEL 4/);
assert.match(pdb, /IDEALIZED MODEL; NOT EXPERIMENTAL OR ENERGY-MINIMIZED/);

const residues = new Map();
let atomCount = 0;
for (const line of pdb.split('\n')) {
  if (!line.startsWith('ATOM')) continue;
  atomCount += 1;
  const chain = line.slice(21, 22);
  const residueNumber = Number(line.slice(22, 26));
  const residueName = line.slice(17, 20).trim().replace(/^D/, '');
  const atomName = line.slice(12, 16).trim();
  const coordinates = [line.slice(30, 38), line.slice(38, 46), line.slice(46, 54)].map(Number);

  assert.ok(['A', 'B'].includes(chain), `Unexpected chain ${chain}`);
  assert.ok(coordinates.every(Number.isFinite), `Invalid coordinates at atom ${atomCount}`);
  const key = `${chain}:${residueNumber}`;
  const residue = residues.get(key) ?? { chain, residueNumber, residueName, atoms: new Set() };
  assert.equal(residue.residueName, residueName, `Mixed residue names at ${key}`);
  residue.atoms.add(atomName);
  residues.set(key, residue);
}

assert.equal(atomCount, 1435, 'The committed all-atom model changed unexpectedly');
for (const chain of ['A', 'B']) {
  const chainResidues = [...residues.values()]
    .filter((residue) => residue.chain === chain)
    .sort((a, b) => a.residueNumber - b.residueNumber);
  assert.equal(chainResidues.length, 35, `Chain ${chain} must contain 35 residues`);
  assert.equal(chainResidues[0].residueNumber, 1);
  assert.equal(chainResidues.at(-1).residueNumber, 35);
  for (const residue of chainResidues) {
    for (const requiredAtom of [
      'P',
      'OP1',
      'OP2',
      "C1'",
      "C2'",
      "C3'",
      "C4'",
      "C5'",
      "O3'",
      "O4'",
      "O5'",
    ]) {
      assert.ok(
        residue.atoms.has(requiredAtom),
        `${chain}:${residue.residueNumber} lacks ${requiredAtom}`,
      );
    }
    assert.ok(
      residue.atoms.has('N1') || residue.atoms.has('N9'),
      `${chain}:${residue.residueNumber} lacks a glycosidic base atom`,
    );
  }
}

const sequenceFor = (chain) =>
  [...residues.values()]
    .filter((residue) => residue.chain === chain)
    .sort((a, b) => a.residueNumber - b.residueNumber)
    .map((residue) => residue.residueName)
    .join('');

assert.equal(sequenceFor('A'), expected, 'Chain A sequence does not match supplied J23101');
assert.equal(sequenceFor('B'), expectedChainB5to3, 'Chain B is not the reverse complement');
assert.equal(
  [...sequenceFor('B')].reverse().join(''),
  expectedAntiparallel,
  'Chain B antiparallel display sequence is incorrect',
);

process.stdout.write(
  'J23101 PDB integrity: 2 chains × 35 residues, sequences and 1,435 atoms verified.\n',
);
