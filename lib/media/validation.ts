import { createHash } from 'node:crypto';

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

export type ValidatedMedia = { mime: string; extension: string; size: number; width: number | null; height: number | null; hash: string };

export function validateMediaFile(name: string, declaredMime: string, bytes: Uint8Array): ValidatedMedia {
  if (!bytes.length) throw new Error('Dosya boş. Başka bir dosya seçin.');
  if (bytes.length > MAX_BYTES) throw new Error('Dosya 6 MB sınırını aşıyor. Daha küçük bir sürüm yükleyin.');
  const detected = detectMime(bytes);
  if (!detected || !ALLOWED.has(detected.mime)) throw new Error('Dosya biçimi desteklenmiyor. PNG, JPEG, WebP veya PDF kullanın.');
  if (declaredMime && declaredMime !== detected.mime) throw new Error('Dosya uzantısı ile gerçek içerik türü eşleşmiyor.');
  const lower = name.toLocaleLowerCase('tr-TR');
  if (!lower.endsWith(`.${detected.extension}`) && !(detected.extension === 'jpg' && lower.endsWith('.jpeg'))) throw new Error('Dosya adı gerçek içerik türüyle eşleşmiyor.');
  const dimensions = detected.mime.startsWith('image/') ? imageDimensions(detected.mime, bytes) : null;
  if (detected.mime.startsWith('image/') && !dimensions) throw new Error('Görsel boyutları doğrulanamadı. Dosyayı yeniden dışa aktarın.');
  if (dimensions && (dimensions.width > 12000 || dimensions.height > 12000)) throw new Error('Görsel boyutları 12.000 piksel sınırını aşıyor.');
  return { mime: detected.mime, extension: detected.extension, size: bytes.length, width: dimensions?.width ?? null, height: dimensions?.height ?? null, hash: createHash('sha256').update(bytes).digest('hex') };
}

function detectMime(bytes: Uint8Array) {
  const pngSignature = [137,80,78,71,13,10,26,10];
  if (bytes.length >= 8 && pngSignature.every((v, i) => byte(bytes, i) === v)) return { mime: 'image/png', extension: 'png' };
  if (byte(bytes, 0) === 0xff && byte(bytes, 1) === 0xd8 && byte(bytes, 2) === 0xff) return { mime: 'image/jpeg', extension: 'jpg' };
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return { mime: 'image/webp', extension: 'webp' };
  if (ascii(bytes, 0, 5) === '%PDF-') return { mime: 'application/pdf', extension: 'pdf' };
  return null;
}

function imageDimensions(mime: string, bytes: Uint8Array) {
  if (mime === 'image/png' && bytes.length >= 24) return { width: readU32(bytes, 16), height: readU32(bytes, 20) };
  if (mime === 'image/jpeg') {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (byte(bytes, offset) !== 0xff) { offset += 1; continue; }
      const marker = byte(bytes, offset + 1); const length = (byte(bytes, offset + 2) << 8) + byte(bytes, offset + 3);
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) return { height: (byte(bytes, offset + 5) << 8) + byte(bytes, offset + 6), width: (byte(bytes, offset + 7) << 8) + byte(bytes, offset + 8) };
      if (!length) break; offset += 2 + length;
    }
  }
  if (mime === 'image/webp' && bytes.length >= 30) {
    const chunk = ascii(bytes, 12, 16);
    if (chunk === 'VP8X') return { width: 1 + readU24LE(bytes, 24), height: 1 + readU24LE(bytes, 27) };
    if (chunk === 'VP8 ' && bytes.length >= 30) return { width: (byte(bytes, 27) << 8 | byte(bytes, 26)) & 0x3fff, height: (byte(bytes, 29) << 8 | byte(bytes, 28)) & 0x3fff };
    if (chunk === 'VP8L' && bytes.length >= 25) { const b1=byte(bytes,21),b2=byte(bytes,22),b3=byte(bytes,23),b4=byte(bytes,24); return { width: 1+(((b2&0x3f)<<8)|b1), height: 1+(((b4&0xf)<<10)|(b3<<2)|((b2&0xc0)>>6)) }; }
  }
  return null;
}
const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
const byte = (bytes: Uint8Array, offset: number) => bytes[offset] ?? 0;
const readU32 = (b: Uint8Array, o: number) => ((byte(b,o)<<24)|(byte(b,o+1)<<16)|(byte(b,o+2)<<8)|byte(b,o+3))>>>0;
const readU24LE = (b: Uint8Array, o: number) => byte(b,o) | (byte(b,o+1)<<8) | (byte(b,o+2)<<16);
