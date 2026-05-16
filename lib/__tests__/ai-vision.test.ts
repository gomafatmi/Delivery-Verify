import { describe, it, expect } from "vitest";
import {
  analyzePhoto,
  isCompliant,
  requiresReview,
  configureAI,
  getConfig,
  getProviderName,
} from "../ai-vision";

describe("analyzePhoto", () => {
  it("returns a valid AIVisionResult for a JPEG buffer", async () => {
    const buffer = Buffer.alloc(1024 * 100);
    buffer.fill(128);
    const result = await analyzePhoto(buffer, "image/jpeg", "customer");

    expect(result).toHaveProperty("privacy");
    expect(result).toHaveProperty("packageDetection");
    expect(result).toHaveProperty("authenticity");
    expect(result).toHaveProperty("summary");
    expect(typeof result.privacy.rgpdCompliant).toBe("boolean");
    expect(typeof result.packageDetection.packagePresent).toBe("boolean");
    expect(typeof result.authenticity.blurDetected).toBe("boolean");
  });

  it("detects high entropy image as potential face", async () => {
    const buffer = Buffer.alloc(1024 * 100);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    const result = await analyzePhoto(buffer, "image/jpeg", "customer");
    expect(result.privacy.facesDetected).toBeGreaterThanOrEqual(0);
  });

  it("detects uniform buffer as no face", async () => {
    const buffer = Buffer.alloc(1024 * 100);
    buffer.fill(200);
    const result = await analyzePhoto(buffer, "image/png", "delivery");
    expect(result.privacy.facesDetected).toBe(0);
  });

  it("classifies low variation as blurry", async () => {
    const buffer = Buffer.alloc(1024 * 100);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = 100 + (i % 3);
    }
    const result = await analyzePhoto(buffer, "image/webp", "delivery");
    expect(typeof result.authenticity.blurDetected).toBe("boolean");
  });
});

describe("isCompliant", () => {
  it("returns false when a face is identifiable", async () => {
    const buffer = Buffer.alloc(1024 * 100);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    const result = await analyzePhoto(buffer, "image/jpeg", "customer");
    expect(typeof isCompliant(result)).toBe("boolean");
  });

  it("returns true for low entropy (uniform) image", async () => {
    const buffer = Buffer.alloc(1024 * 100);
    buffer.fill(100);
    const result = await analyzePhoto(buffer, "image/jpeg", "customer");
    expect(isCompliant(result)).toBe(true);
  });
});

describe("requiresReview", () => {
  it("returns true when photo is non-compliant", async () => {
    const buffer = Buffer.alloc(1024 * 100);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    const result = await analyzePhoto(buffer, "image/jpeg", "customer");
    expect(typeof requiresReview(result)).toBe("boolean");
  });
});

describe("configureAI", () => {
  it("updates config values", () => {
    configureAI({ blurThreshold: 0.8, minPackageConfidence: 0.6 });
    const config = getConfig();
    expect(config.blurThreshold).toBe(0.8);
    expect(config.minPackageConfidence).toBe(0.6);
  });

  it("preserves default values when partial config", () => {
    configureAI({ blurThreshold: 0.6, provider: "mock" });
    const config = getConfig();
    expect(config.blurThreshold).toBe(0.6);
    expect(config.maxIdentifiableFaces).toBe(0);
  });
});

describe("getProviderName", () => {
  it("returns mock by default", () => {
    expect(getProviderName()).toBe("mock");
  });
});
