import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { packageSkill, verifySkillZip, readStoredZip, encodeStoredZip } from '../scripts/package-skill.mjs';

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wadiz-release-')), skill = path.join(root, 'wadiz-detail-page-production');
  const files = { 'SKILL.md': '---\nname: wadiz-detail-page-production\ndescription: Test skill\n---\n# Skill\n', 'README.md': '# Install\n', 'release.json': JSON.stringify({ schema_version: 1, name: 'wadiz-detail-page-production', version: '0.3.0', node: '>=20.9.0', repository: 'https://github.com/contentscoin/wadiz-detail-page-production-skill' }), 'scripts/package.json': JSON.stringify({ version: '0.3.0', engines: { node: '>=20.9.0' } }), 'scripts/package-lock.json': '{}', 'schemas/contracts.schema.json': '{}', 'references/workflow.md': '# Workflow\n', 'assets/sangse/style.json': '{"source":"sangse"}', 'scripts/test.mjs': 'export const value = 1;\n', 'scripts/node_modules/dependency/index.js': 'excluded dependency', 'scripts/output/image.png': 'excluded output', 'assets/.env.production': 'excluded env', 'assets/credentials.json': 'excluded credential file', '.git/config': 'excluded git' };
  for (const [name, data] of Object.entries(files)) { const file = path.join(skill, name); await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, data); }
  await fs.writeFile(path.join(root, 'LICENSE'), 'MIT License\nCopyright (c) 2026 contentscoin\n');
  await fs.writeFile(path.join(root, 'THIRD_PARTY_NOTICES.md'), 'MIT License\nCopyright (c) 2026 fivetaku\n');
  return { root, skill };
}

test('self-contained release includes resources/licenses and exact manifest/checksum integrity', async () => {
  const { root, skill } = await fixture();
  try {
    const out = path.join(root, 'output', 'skill.zip'), result = await packageSkill({ skillDir: skill, outFile: out });
    assert.equal(result.version, '0.3.0'); assert.equal(result.integrity, 'verified');
    const bytes = await fs.readFile(out), entries = readStoredZip(bytes), prefix = 'wadiz-detail-page-production/';
    assert.ok(entries.has(prefix + 'LICENSE')); assert.ok(entries.has(prefix + 'THIRD_PARTY_NOTICES.md'));
    assert.ok(entries.has(prefix + 'assets/sangse/style.json')); assert.ok(entries.has(prefix + 'scripts/test.mjs'));
    assert.ok(![...entries.keys()].some((name) => /node_modules|\.env|credentials|\/output\/|\.git/.test(name)));
    const manifest = JSON.parse(entries.get(prefix + 'PACKAGE-MANIFEST.json'));
    for (const file of manifest.files) assert.equal(createHash('sha256').update(entries.get(prefix + file.path)).digest('hex'), file.sha256);
    assert.equal((await fs.readFile(`${out}.sha256`, 'utf8')).split(' ')[0], createHash('sha256').update(bytes).digest('hex'));
    assert.equal((await verifySkillZip(out)).files, entries.size);
    await assert.rejects(packageSkill({ skillDir: skill, outFile: out }), /already exists/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('resource or manifest corruption and unlisted archive files are rejected', async () => {
  const { root, skill } = await fixture();
  try {
    const out = path.join(root, 'release.zip'); await packageSkill({ skillDir: skill, outFile: out });
    const bytes = await fs.readFile(out), entries = readStoredZip(bytes), prefix = 'wadiz-detail-page-production/';
    const changed = new Map(entries); changed.set(prefix + 'references/workflow.md', Buffer.from('changed source\n'));
    await assert.rejects(verifySkillZip(encodeStoredZip([...changed].map(([name, data]) => ({ name, data })))), /SHA-256/);
    const extra = new Map(entries); extra.set(prefix + 'unexpected.txt', Buffer.from('extra'));
    await assert.rejects(verifySkillZip(encodeStoredZip([...extra].map(([name, data]) => ({ name, data })))), /file list differs/);
    const damaged = Buffer.from(bytes); damaged[damaged.indexOf(Buffer.from('# Workflow'))] ^= 1;
    await assert.rejects(verifySkillZip(damaged), /CRC/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('selected symlink resources and output-parent symlinks are refused', async () => {
  const { root, skill } = await fixture();
  try {
    const outside = path.join(root, 'outside'); await fs.mkdir(outside);
    await fs.symlink(outside, path.join(skill, 'references', 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(packageSkill({ skillDir: skill, outFile: path.join(root, 'blocked.zip') }), /Symlink\/junction/);
    await fs.unlink(path.join(skill, 'references', 'linked'));
    const destination = path.join(root, 'linked-output'); await fs.symlink(outside, destination, process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(packageSkill({ skillDir: skill, outFile: path.join(destination, 'release.zip') }), /Symlink\/junction/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('release metadata mismatches and credential-like data fail before creating an archive', async () => {
  const { root, skill } = await fixture();
  try {
    const pkg = path.join(skill, 'scripts', 'package.json'); await fs.writeFile(pkg, JSON.stringify({ version: '0.2.0', engines: { node: '>=20.9.0' } }));
    await assert.rejects(packageSkill({ skillDir: skill, outFile: path.join(root, 'bad-version.zip') }), /version or Node requirement mismatch/);
    await fs.writeFile(pkg, JSON.stringify({ version: '0.3.0', engines: { node: '>=20.9.0' } }));
    await fs.writeFile(path.join(skill, 'assets', 'leak.json'), JSON.stringify({ token: `sk-${'a'.repeat(32)}` }));
    await assert.rejects(packageSkill({ skillDir: skill, outFile: path.join(root, 'bad-secret.zip') }), /Credential-like/);
    assert.equal(await fs.stat(path.join(root, 'bad-secret.zip')).catch(() => null), null);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
