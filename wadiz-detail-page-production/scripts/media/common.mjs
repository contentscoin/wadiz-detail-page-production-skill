import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

export const execFileAsync = promisify(execFile);
export const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
export const escapeHtml = (text = '') => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const isMain = (url) => !!process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(url);
export async function readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }
export async function writeJson(file, value) { await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
export function assertId(id, label = 'id') {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(id)) throw new Error(`Invalid ${label}: ${id}`);
  return id;
}
export async function localFile(baseDir, file) {
  if (typeof file !== 'string' || !file || /^[a-z]+:\/\//i.test(file)) throw new Error('A local file is required');
  const absolute = path.resolve(baseDir, file);
  const stat = await fs.stat(absolute);
  if (!stat.isFile()) throw new Error(`Not a file: ${file}`);
  return absolute;
}
