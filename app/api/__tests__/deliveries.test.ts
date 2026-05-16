import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { auth } from "@/lib/auth";

describe("Deliveries API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { GET } = await import("../deliveries/route");
    const req = new Request("http://localhost:3000/api/deliveries");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin tries to create", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", role: "customer", name: "Test" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });
    const { POST } = await import("../deliveries/route");
    const req = new Request("http://localhost:3000/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amazonOrderId: "ORD-001" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
