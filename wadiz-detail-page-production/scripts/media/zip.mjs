// Small, dependency-free, stored ZIP writer. Only explicitly selected deliverables
// are archived; source folders, credentials, and dependency trees are never scanned.
import fs from 'node:fs/promises';

const table = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
export async function writeZip(output, entries) {
  const locals = [], central = [];
  let offset = 0;
  for (const { name, file } of entries) {
    if (name.includes('..') || name.startsWith('/') || name.includes('\\') || /(^|\/)(\.env[^/]*|\.git|node_modules)(\/|$)/i.test(name)) throw new Error(`Unsafe ZIP path: ${name}`);
    const data = await fs.readFile(file), filename = Buffer.from(name, 'utf8'), checksum = crc32(data);
    if (data.length > 0xffffffff || offset > 0xffffffff) throw new Error('ZIP64 is not supported');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6);
    local.writeUInt32LE(checksum, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(filename.length, 26);
    locals.push(local, filename, data);
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(20, 6); header.writeUInt16LE(0x800, 8);
    header.writeUInt32LE(checksum, 16); header.writeUInt32LE(data.length, 20); header.writeUInt32LE(data.length, 24); header.writeUInt16LE(filename.length, 28); header.writeUInt32LE(offset, 42);
    central.push(header, filename); offset += local.length + filename.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  await fs.writeFile(output, Buffer.concat([...locals, directory, end]));
}
