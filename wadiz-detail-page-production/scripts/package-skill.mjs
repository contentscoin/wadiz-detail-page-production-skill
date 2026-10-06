#!/usr/bin/env node
// Node built-ins only: installed skill packaging must not require npm install.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const NAME = 'wadiz-detail-page-production';
const ROOT_FILES = new Set(['SKILL.md', 'README.md', 'release.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md']);
const RESOURCE_DIRS = new Set(['agents', 'assets', 'examples', 'references', 'schemas', 'scripts', 'tests']);
const EXTENSIONS = new Set(['.md', '.mjs', '.js', '.cjs', '.json', '.yaml', '.yml', '.py', '.txt', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.css', '.html', '.woff', '.woff2', '.ttf', '.otf']);
const OMIT = /^(?:node_modules|\.git|\.env(?:\..*)?|outputs?|generated|dist|build|coverage|\.cache|__pycache__|\.pytest_cache|\.playwright-cli|auth|credentials?|tokens?|secrets?)(?:\.|$)/i;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const crcTable = Array.from({ length: 256 }, (_, n) => { for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
function crc32(bytes) { let n = 0xffffffff; for (const byte of bytes) n = crcTable[(n ^ byte) & 255] ^ (n >>> 8); return (n ^ 0xffffffff) >>> 0; }
function safeName(name) { return typeof name === 'string' && name && !name.startsWith('/') && !name.includes('\\') && !name.split('/').some((part) => !part || ['.', '..'].includes(part) || OMIT.test(part)); }

export function encodeStoredZip(entries) {
  if (entries.length > 65535) throw new Error('ZIP64 is not supported');
  const locals = [], headers = [], seen = new Set(); let offset = 0;
  for (const { name, data } of entries) {
    if (!safeName(name) || seen.has(name)) throw new Error(`Unsafe or duplicate package path: ${name}`);
    seen.add(name); const label = Buffer.from(name), crc = crc32(data);
    if (data.length > 0xffffffff || offset > 0xffffffff || label.length > 65535) throw new Error('ZIP64 is not supported');
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(33, 12); local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(label.length, 26);
    const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8); central.writeUInt16LE(33, 14); central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(label.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, label, data); headers.push(central, label); offset += local.length + label.length + data.length;
  }
  const directory = Buffer.concat(headers), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

export function readStoredZip(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 22 || bytes.readUInt32LE(bytes.length - 22) !== 0x06054b50) throw new Error('Invalid stored ZIP end record');
  const end = bytes.length - 22, count = bytes.readUInt16LE(end + 10), directorySize = bytes.readUInt32LE(end + 12), directoryStart = bytes.readUInt32LE(end + 16);
  if (bytes.readUInt16LE(end + 8) !== count || directoryStart + directorySize !== end || bytes.readUInt16LE(end + 20)) throw new Error('ZIP directory mismatch');
  const entries = new Map(); let p = directoryStart;
  for (let i = 0; i < count; i++) {
    if (p + 46 > end || bytes.readUInt32LE(p) !== 0x02014b50 || bytes.readUInt16LE(p + 10) !== 0) throw new Error('Unsupported or invalid ZIP central entry');
    const size = bytes.readUInt32LE(p + 24), nameSize = bytes.readUInt16LE(p + 28), extra = bytes.readUInt16LE(p + 30), comment = bytes.readUInt16LE(p + 32), offset = bytes.readUInt32LE(p + 42);
    const name = bytes.toString('utf8', p + 46, p + 46 + nameSize);
    if (!safeName(name) || entries.has(name) || offset + 30 > directoryStart || bytes.readUInt32LE(offset) !== 0x04034b50 || bytes.readUInt16LE(offset + 8) !== 0) throw new Error('Unsafe, duplicate or invalid ZIP local entry');
    const localName = bytes.readUInt16LE(offset + 26), localExtra = bytes.readUInt16LE(offset + 28), start = offset + 30 + localName + localExtra;
    if (bytes.toString('utf8', offset + 30, offset + 30 + localName) !== name || start + size > directoryStart || bytes.readUInt32LE(offset + 18) !== size || bytes.readUInt32LE(p + 20) !== size) throw new Error('ZIP local/central mismatch');
    const data = bytes.subarray(start, start + size), crc = crc32(data);
    if (crc !== bytes.readUInt32LE(p + 16) || crc !== bytes.readUInt32LE(offset + 14)) throw new Error('ZIP CRC integrity failure');
    entries.set(name, data); p += 46 + nameSize + extra + comment;
  }
  if (p !== end) throw new Error('ZIP central directory length mismatch');
  return entries;
}

function secretText(bytes, name) {
  if (!['.md', '.json', '.yaml', '.yml', '.txt', '.svg', '.html'].includes(path.extname(name).toLowerCase())) return;
  const text = bytes.toString('utf8');
  if (/\bsk-[A-Za-z0-9_-]{24,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*["']?[A-Za-z0-9_-]{16,}/.test(text)) throw new Error(`Credential-like content in package resource: ${name}`);
}
async function noSymlink(file) {
  const resolved = path.resolve(file), parsed = path.parse(resolved); let current = parsed.root;
  for (const component of resolved.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, component); const info = await fs.lstat(current).catch((error) => { if (error.code === 'ENOENT') return null; throw error; });
    if (info?.isSymbolicLink()) throw new Error(`Symlink/junction is not allowed in package path: ${current}`);
  }
}
async function collectResources(skillDir) {
  const files = new Map();
  const walk = async (relative) => {
    const absolute = path.join(skillDir, relative), info = await fs.lstat(absolute);
    if (info.isSymbolicLink()) throw new Error(`Symlink/junction package resource: ${relative}`);
    if (info.isDirectory()) {
      for (const entry of (await fs.readdir(absolute)).sort()) if (!OMIT.test(entry)) await walk(path.join(relative, entry));
    } else if (info.isFile()) {
      const name = relative.split(path.sep).join('/');
      if (!EXTENSIONS.has(path.extname(name).toLowerCase()) && !['LICENSE', 'NOTICE'].includes(path.basename(name))) return;
      const bytes = await fs.readFile(absolute); secretText(bytes, name); files.set(name, bytes);
    } else throw new Error(`Unsupported package resource: ${relative}`);
  };
  for (const entry of (await fs.readdir(skillDir)).sort()) if (ROOT_FILES.has(entry) || RESOURCE_DIRS.has(entry)) await walk(entry);
  return files;
}

export async function verifySkillZip(source) {
  const bytes = Buffer.isBuffer(source) ? source : await fs.readFile(source), entries = readStoredZip(bytes), prefix = `${NAME}/`;
  if ([...entries.keys()].some((name) => !name.startsWith(prefix))) throw new Error('Unexpected package root');
  const read = (name) => { const bytes = entries.get(prefix + name); if (!bytes) throw new Error(`Missing package resource: ${name}`); return bytes; };
  const release = JSON.parse(read('release.json')), manifest = JSON.parse(read('PACKAGE-MANIFEST.json'));
  if (release.schema_version !== 1 || release.name !== NAME || !/^\d+\.\d+\.\d+$/.test(release.version) || manifest.version !== release.version || manifest.name !== release.name || manifest.schema_version !== 1) throw new Error('Release/manifest metadata mismatch');
  const listed = new Set();
  for (const file of manifest.files ?? []) {
    if (!safeName(file.path) || listed.has(file.path)) throw new Error('Unsafe/duplicate manifest path');
    listed.add(file.path); const bytes = read(file.path);
    if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) throw new Error(`Manifest SHA-256 integrity failure: ${file.path}`);
  }
  const expected = new Set([...listed, 'PACKAGE-MANIFEST.json', 'SHA256SUMS']);
  if (entries.size !== expected.size || [...entries.keys()].some((name) => !expected.has(name.slice(prefix.length)))) throw new Error('Manifest/archive file list differs');
  const checksumLines = read('SHA256SUMS').toString('utf8').trim().split('\n'), checked = new Set();
  for (const line of checksumLines) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match || checked.has(match[2]) || !expected.has(match[2]) || match[2] === 'SHA256SUMS' || hash(read(match[2])) !== match[1]) throw new Error('Package checksum integrity failure');
    checked.add(match[2]);
  }
  if (checked.size !== expected.size - 1) throw new Error('Package checksums incomplete');
  for (const required of ['SKILL.md', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'release.json', 'scripts/package.json', 'scripts/package-lock.json', 'schemas/contracts.schema.json']) read(required);
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(read('SKILL.md').toString('utf8'))?.[1];
  if (!frontmatter || !/^name:\s*wadiz-detail-page-production\s*$/m.test(frontmatter) || !/^description:\s*\S/m.test(frontmatter)) throw new Error('Skill frontmatter/name invalid');
  return { name: NAME, version: release.version, files: entries.size, bytes: bytes.length, sha256: hash(bytes), integrity: 'verified' };
}

export async function packageSkill({ skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), repoDir = path.dirname(skillDir), outFile } = {}) {
  if (!outFile || path.extname(outFile).toLowerCase() !== '.zip') throw new Error('A new --out .zip file is required');
  skillDir = path.resolve(skillDir); const output = path.resolve(outFile), checksumFile = `${output}.sha256`;
  await noSymlink(skillDir); await noSymlink(output);
  if (await fs.lstat(output).catch(() => null) || await fs.lstat(checksumFile).catch(() => null)) throw new Error('Release output already exists; choose a new path');
  const files = await collectResources(skillDir);
  for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
    const file = path.join(repoDir, name); await noSymlink(file);
    const bytes = await fs.readFile(file).catch((error) => { if (error.code === 'ENOENT' && files.has(name)) return files.get(name); throw error; });
    if (files.has(name) && !files.get(name).equals(bytes)) throw new Error(`Conflicting ${name}`);
    files.set(name, bytes);
  }
  const release = JSON.parse(files.get('release.json')?.toString('utf8') ?? 'null');
  if (!release || release.schema_version !== 1 || release.name !== NAME || !/^\d+\.\d+\.\d+$/.test(release.version) || release.node !== '>=20.9.0' || typeof release.repository !== 'string') throw new Error('Valid release.json is required');
  const pkg = JSON.parse(files.get('scripts/package.json')?.toString('utf8') ?? 'null');
  if (pkg?.version !== release.version || pkg?.engines?.node !== release.node) throw new Error('Release/package version or Node requirement mismatch');
  const manifest = { schema_version: 1, name: release.name, version: release.version, node: release.node, repository: release.repository, files: [...files].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([name, bytes]) => ({ path: name, bytes: bytes.length, sha256: hash(bytes) })) };
  files.set('PACKAGE-MANIFEST.json', Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
  files.set('SHA256SUMS', Buffer.from([...files].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([name, bytes]) => `${hash(bytes)}  ${name}\n`).join('')));
  const bytes = encodeStoredZip([...files].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([name, data]) => ({ name: `${NAME}/${name}`, data })));
  const report = await verifySkillZip(bytes);
  await fs.mkdir(path.dirname(output), { recursive: true }); await noSymlink(output);
  await fs.writeFile(output, bytes, { flag: 'wx' });
  await fs.writeFile(checksumFile, `${report.sha256}  ${path.basename(output)}\n`, { flag: 'wx' });
  return { ...report, output, checksum_file: checksumFile };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) console.log('Usage: node package-skill.mjs --out <new-release.zip> [--skill-dir <skill>]\n       node package-skill.mjs --verify <release.zip>\nBuilt-in Node only; packages allowlisted resources, licenses and SHA-256 manifests.');
  else try {
    const options = {};
    for (let i = 0; i < args.length; i += 2) { if (!['--out', '--skill-dir', '--verify'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Unknown/missing option: ${args[i]}`); options[args[i].slice(2)] = args[i + 1]; }
    if (options.verify && (options.out || options['skill-dir'])) throw new Error('--verify cannot be combined with package options');
    console.log(JSON.stringify(options.verify ? await verifySkillZip(options.verify) : await packageSkill({ outFile: options.out, ...(options['skill-dir'] ? { skillDir: options['skill-dir'] } : {}) }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
