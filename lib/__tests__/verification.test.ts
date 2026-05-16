import { describe, it, expect, vi } from "vitest";
import { verifyLocation } from "../verification";

const mockDeps = {
  db: {
    createSession: vi.fn().mockResolvedValue({ id: "session-1" }),
    createEvent: vi.fn().mockResolvedValue({ id: "event-1" }),
    getDelivery: vi.fn().mockResolvedValue({ otpCode: "123456", status: "arrived" }),
    updateDeliveryStatus: vi.fn(),
    completeSession: vi.fn(),
  },
  photo: {
    savePhoto: vi.fn().mockResolvedValue({ filePath: "/tmp/photo.jpg", fileHash: "abc123" }),
  },
  gps: vi.fn().mockReturnValue(true),
};

describe("verifyLocation", () => {
  it("passes when GPS within radius", async () => {
    mockDeps.gps.mockReturnValue(true);
    const result = await verifyLocation(
      "session-1",
      { lat: 48.8566, lng: 2.3522, accuracy: 10 },
      { lat: 48.8567, lng: 2.3523, accuracy: 10 },
      mockDeps
    );
    expect(result.success).toBe(true);
    expect(result.step).toBe("gps_check");
  });

  it("fails when GPS outside radius", async () => {
    mockDeps.gps.mockReturnValue(false);
    const result = await verifyLocation(
      "session-1",
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.86, lng: 2.36 },
      mockDeps
    );
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
