export interface FaceBlurResult {
  blurred: boolean;
  originalBuffer: Buffer;
  blurredBuffer: Buffer | null;
  facesBlurred: number;
  mimeType: string;
}

export interface FaceBlurProvider {
  blurFaces(buffer: Buffer, mimeType: string): Promise<FaceBlurResult>;
  name: string;
}

function applyPixelation(buffer: Buffer, width: number, height: number): Buffer {
  const bytesPerPixel = 4;
  const blockSize = Math.max(8, Math.floor(Math.min(width, height) / 20));
  const stride = width * bytesPerPixel;
  const out = Buffer.from(buffer);

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const idx = (y + dy) * stride + (x + dx) * bytesPerPixel;
          if (idx + 2 < buffer.length) {
            r += buffer[idx]!;
            g += buffer[idx + 1]!;
            b += buffer[idx + 2]!;
            count++;
          }
        }
      }
      if (count === 0) continue;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const idx = (y + dy) * stride + (x + dx) * bytesPerPixel;
          if (idx + 2 < out.length) {
            out[idx] = r;
            out[idx + 1] = g;
            out[idx + 2] = b;
          }
        }
      }
    }
  }
  return out;
}

function isJpeg(buf: Buffer): boolean {
  return buf.length > 2 && buf[0]! === 0xFF && buf[1]! === 0xD8;
}

function isPng(buf: Buffer): boolean {
  return buf.length > 8 &&
    buf[0]! === 0x89 && buf[1]! === 0x50 && buf[2]! === 0x4E && buf[3]! === 0x47;
}

function rawImageDimensions(buf: Buffer): { width: number; height: number } | null {
  if (isJpeg(buf)) {
    let offset = 2;
    while (offset + 4 < buf.length) {
      if (buf[offset]! === 0xFF && buf[offset + 1]! === 0xC0) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return { width, height };
      }
      offset += 2 + buf.readUInt16BE(offset + 2);
    }
    return null;
  }
  if (isPng(buf) && buf.length > 24) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }
  return { width: 640, height: 480 };
}

const mockBlurProvider: FaceBlurProvider = {
  name: "mock-blur",

  async blurFaces(buffer: Buffer, mimeType: string): Promise<FaceBlurResult> {
    const dims = rawImageDimensions(buffer);
    if (!dims) {
      return {
        blurred: false,
        originalBuffer: buffer,
        blurredBuffer: null,
        facesBlurred: 0,
        mimeType,
      };
    }

    const w = dims.width;
    const h = dims.height;
    const rgba = Buffer.alloc(w * h * 4);
    for (let i = 0; i < rgba.length && i < buffer.length; i++) {
      const val = buffer[i];
      if (val !== undefined) rgba[i] = val;
    }
    for (let i = buffer.length; i < rgba.length; i++) {
      rgba[i] = 255;
    }

    const blurredRgba = applyPixelation(rgba, w, h);

    const output = Buffer.alloc(buffer.length);
    for (let i = 0; i < output.length && i < blurredRgba.length; i++) {
      const val = blurredRgba[i];
      if (val !== undefined) output[i] = val;
    }

    return {
      blurred: true,
      originalBuffer: buffer,
      blurredBuffer: output,
      facesBlurred: 1,
      mimeType,
    };
  },
};

let activeBlurProvider: FaceBlurProvider = mockBlurProvider;

export function setFaceBlurProvider(provider: FaceBlurProvider): void {
  activeBlurProvider = provider;
}

export async function blurFaces(
  buffer: Buffer,
  mimeType: string
): Promise<FaceBlurResult> {
  return activeBlurProvider.blurFaces(buffer, mimeType);
}
