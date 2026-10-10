// Minimal, dependency-free ZIP writer for packaging a single-file inline Lambda.
//
// AWS Lambda's CreateFunction/UpdateFunctionCode accept a ZIP archive. Rather
// than pull in a zip dependency, we emit a tiny STORE (uncompressed) ZIP for a
// single entry — all that the inline /hello handler needs. The format follows
// the PKZIP APPNOTE: a local file header + data, then one central directory
// record, then the end-of-central-directory record.

import { Buffer } from 'node:buffer';

// Precomputed CRC-32 table (IEEE 802.3 polynomial 0xEDB88320).
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Build a STORE (uncompressed) ZIP containing a single file.
 *
 * @param {string} filename  Entry name inside the archive (e.g. "index.js").
 * @param {string} contents  UTF-8 file contents.
 * @returns {Buffer}         The ZIP archive bytes.
 */
export function zipInlineFunction(filename, contents) {
  const nameBuf = Buffer.from(filename, 'utf8');
  const data = Buffer.from(contents, 'utf8');
  const crc = crc32(data);
  const size = data.length;

  // Local file header (signature 0x04034b50).
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); // version needed
  local.writeUInt16LE(0, 6); // flags
  local.writeUInt16LE(0, 8); // method 0 = store
  local.writeUInt16LE(0, 10); // mod time
  local.writeUInt16LE(0, 12); // mod date
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(size, 18); // compressed size
  local.writeUInt32LE(size, 22); // uncompressed size
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28); // extra len

  const localHeader = Buffer.concat([local, nameBuf, data]);

  // Central directory file header (signature 0x02014b50).
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4); // version made by
  central.writeUInt16LE(20, 6); // version needed
  central.writeUInt16LE(0, 8); // flags
  central.writeUInt16LE(0, 10); // method
  central.writeUInt16LE(0, 12); // mod time
  central.writeUInt16LE(0, 14); // mod date
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(size, 20);
  central.writeUInt32LE(size, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt16LE(0, 30); // extra len
  central.writeUInt16LE(0, 32); // comment len
  central.writeUInt16LE(0, 34); // disk number start
  central.writeUInt16LE(0, 36); // internal attrs
  central.writeUInt32LE(0, 38); // external attrs
  central.writeUInt32LE(0, 42); // local header offset

  const centralHeader = Buffer.concat([central, nameBuf]);

  // End of central directory (signature 0x06054b50).
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4); // disk number
  end.writeUInt16LE(0, 6); // disk with central dir
  end.writeUInt16LE(1, 8); // entries on this disk
  end.writeUInt16LE(1, 10); // total entries
  end.writeUInt32LE(centralHeader.length, 12); // central dir size
  end.writeUInt32LE(localHeader.length, 16); // central dir offset
  end.writeUInt16LE(0, 20); // comment len

  return Buffer.concat([localHeader, centralHeader, end]);
}
