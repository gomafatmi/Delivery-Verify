import type { GPSData, VerificationStepResult } from "@/types/verification";
import { isWithinRadius } from "./gps";
import { logger } from "./audit";

const GPS_RADIUS_METERS = 50;
const OTP_REGENERATION_COOLDOWN_MS = 30_000;

export interface VerificationDeps {
  db: {
    createSession: (
      deliveryId: string
    ) => Promise<{ id: string }>;
    createEvent: (params: {
      sessionId: string;
      eventType: string;
      status: string;
      metadata?: Record<string, unknown>;
    }) => Promise<{ id: string }>;
    getDelivery: (
      deliveryId: string
    ) => Promise<{ otpCode: string | null; status: string } | null>;
    updateDeliveryStatus: (
      deliveryId: string,
      status: string
    ) => Promise<void>;
    completeSession: (
      sessionId: string,
      status: "passed" | "failed"
    ) => Promise<void>;
  };
  photo: {
    savePhoto: (
      buffer: Buffer,
      mimeType: string,
      deliveryId: string,
      type: string
    ) => Promise<{ filePath: string; fileHash: string }>;
    verifyExif?: (buffer: Buffer) => boolean;
  };
  gps: typeof isWithinRadius;
}

export async function verifyLocation(
  sessionId: string,
  deliveryGps: GPSData,
  customerGps: GPSData,
  deps: VerificationDeps
): Promise<VerificationStepResult> {
  const withinRange = deps.gps(
    deliveryGps.lat,
    deliveryGps.lng,
    customerGps.lat,
    customerGps.lng,
    GPS_RADIUS_METERS
  );
  const event = await deps.db.createEvent({
    sessionId,
    eventType: "gps_check",
    status: withinRange ? "success" : "failed",
    metadata: {
      deliveryGps,
      customerGps,
      distanceMeters: calculateDistance(deliveryGps, customerGps),
      thresholdMeters: GPS_RADIUS_METERS,
    },
  });
  logger.info("gps_check", {
    sessionId,
    withinRange,
    distanceMeters: calculateDistance(deliveryGps, customerGps),
  });
  return {
    step: "gps_check",
    success: withinRange,
    eventId: event.id,
    ...(withinRange ? {} : { error: "Customer not within delivery radius" }),
  };
}

export async function verifyPhoto(
  sessionId: string,
  buffer: Buffer,
  mimeType: string,
  deliveryId: string,
  captureGps: GPSData | null,
  role: "customer" | "delivery",
  deps: VerificationDeps
): Promise<VerificationStepResult> {
  const eventType =
    role === "customer" ? "photo_customer" : "photo_delivery";
  let saved;
  try {
    saved = await deps.photo.savePhoto(buffer, mimeType, deliveryId, eventType);
  } catch (err) {
    const error =
      err instanceof Error ? err.message : "Photo save failed";
    const event = await deps.db.createEvent({
      sessionId,
      eventType,
      status: "failed",
      metadata: { error, mimeType },
    });
    logger.error("photo_failed", { sessionId, role, error });
    return { step: eventType, success: false, eventId: event.id, error };
  }
  const event = await deps.db.createEvent({
    sessionId,
    eventType,
    status: "success",
    metadata: {
      filePath: saved.filePath,
      fileHash: saved.fileHash,
      gps: captureGps,
    },
  });
  logger.info("photo_captured", { sessionId, role, fileHash: saved.fileHash });
  return { step: eventType, success: true, eventId: event.id };
}

export async function verifyOTP(
  sessionId: string,
  deliveryId: string,
  otpEntered: string,
  deps: VerificationDeps
): Promise<VerificationStepResult> {
  const delivery = await deps.db.getDelivery(deliveryId);
  const isValid = delivery?.otpCode === otpEntered;
  const event = await deps.db.createEvent({
    sessionId,
    eventType: "otp_entry",
    status: isValid ? "success" : "failed",
    metadata: { otpLength: otpEntered.length },
  });
  logger.info("otp_check", { sessionId, isValid });
  return {
    step: "otp_entry",
    success: isValid,
    eventId: event.id,
    ...(isValid ? {} : { error: "Invalid OTP code" }),
  };
}

export async function confirmHandover(
  sessionId: string,
  role: "customer" | "delivery",
  signature: string,
  deps: VerificationDeps
): Promise<VerificationStepResult> {
  const eventType =
    role === "customer"
      ? "signature_customer"
      : "signature_delivery";
  const event = await deps.db.createEvent({
    sessionId,
    eventType,
    status: "success",
    metadata: { signatureLength: signature.length },
  });
  logger.info("handover_confirmed", { sessionId, role });
  return { step: eventType, success: true, eventId: event.id };
}

function calculateDistance(a: GPSData, b: GPSData): number {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2) * 111_320;
}
