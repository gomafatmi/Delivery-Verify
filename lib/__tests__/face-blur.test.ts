import { describe, it, expect } from "vitest";
import { blurFaces, setFaceBlurProvider } from "../face-blur";

describe("blurFaces", () => {
  it("returns a FaceBlurResult with blurred=true for JPEG", async () => {
    const buf = Buffer.alloc(640 * 480 * 4);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
    const result = await blurFaces(buf, "image/jpeg");
    expect(result.blurred).toBe(true);
    expect(result.facesBlurred).toBeGreaterThan(0);
    expect(result.originalBuffer).toBe(buf);
    expect(result.blurredBuffer).not.toBeNull();
  });

  it("returns buffers of different content after blur", async () => {
    const buf = Buffer.alloc(640 * 480 * 4);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = i % 256;
    }
    const result = await blurFaces(buf, "image/png");
    expect(result.blurredBuffer).not.toBeNull();
    const hasDiff = result.blurredBuffer!.some((v, i) => v !== result.originalBuffer[i]);
    expect(hasDiff).toBe(true);
  });

  it("handles small buffer gracefully", async () => {
    const buf = Buffer.alloc(100);
    buf.fill(128);
    const result = await blurFaces(buf, "image/png");
    expect(result.blurred).toBe(true);
  });
});
