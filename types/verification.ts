export type VerificationSessionStatus = "in_progress" | "passed" | "failed";

export type VerificationEventType =
  | "arrival"
  | "gps_check"
  | "photo_customer"
  | "photo_delivery"
  | "otp_entry"
  | "signature_customer"
  | "signature_delivery"
  | "confirmation"
  | "package_check"
  | "ai_vision_check"
  | "privacy_check";

export type VerificationEventStatus = "pending" | "success" | "failed";

export type EvidenceType = "photo" | "signature" | "screenshot";

export interface VerificationSession {
  id: string;
  deliveryId: string;
  status: VerificationSessionStatus;
  startedAt: Date;
  completedAt: Date | null;
  events: VerificationEvent[];
}

export interface VerificationEvent {
  id: string;
  sessionId: string;
  eventType: VerificationEventType;
  status: VerificationEventStatus;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  evidence: Evidence[];
}

export interface Evidence {
  id: string;
  eventId: string;
  type: EvidenceType;
  filePath: string;
  fileHash: string;
  gpsLat: number | null;
  gpsLng: number | null;
  capturedAt: Date;
}

export interface GPSData {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface VerificationStepResult {
  step: VerificationEventType;
  success: boolean;
  eventId: string;
  error?: string;
}
