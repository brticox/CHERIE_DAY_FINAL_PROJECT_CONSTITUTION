import { describe, expect, it } from 'vitest';
import { validateMediaFile } from '@/lib/media/validation';

function png(width = 800, height = 600) {
  const bytes = new Uint8Array(24); bytes.set([137,80,78,71,13,10,26,10]); bytes.set([0,0,0,13,73,72,68,82],8);
  new DataView(bytes.buffer).setUint32(16,width); new DataView(bytes.buffer).setUint32(20,height); return bytes;
}

describe('admin media validation', () => {
  it('reads trusted PNG dimensions and hashes content', () => {
    const result = validateMediaFile('cover.png','image/png',png());
    expect(result).toMatchObject({mime:'image/png',extension:'png',width:800,height:600});
    expect(result.hash).toHaveLength(64);
  });
  it('rejects a MIME spoof', () => expect(() => validateMediaFile('cover.jpg','image/jpeg',png())).toThrow(/eşleşmiyor/));
  it('rejects an extension spoof', () => expect(() => validateMediaFile('cover.jpg','image/png',png())).toThrow(/Dosya adı/));
  it('rejects unsupported bytes', () => expect(() => validateMediaFile('file.exe','application/octet-stream',new Uint8Array([1,2,3]))).toThrow(/desteklenmiyor/));
  it('rejects files above the operational limit', () => expect(() => validateMediaFile('large.png','image/png',new Uint8Array(6*1024*1024+1))).toThrow(/6 MB/));
});
