import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export interface PhotoResult {
  filePath: string;
  fileHash: string;
}

export async function savePhoto(
  buffer: Buffer,
  mimeType: string,
  deliveryId: string,
  type: string
): Promise<PhotoResult> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }
  if (buffer.length > MAX_SIZE) {
    throw new Error("Image exceeds 10MB limit");
  }
  const dir = path.join(UPLOAD_DIR, deliveryId);
  await fs.mkdir(dir, { recursive: true });
  const ext = mimeType.split("/")[1];
  const filename = `${type}_${Date.now()}.${ext}`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
  return { filePath, fileHash };
}
