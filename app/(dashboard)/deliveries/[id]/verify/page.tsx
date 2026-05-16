"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Localisation", "Photos", "OTP", "Confirmation"];

type StepStatus = "pending" | "active" | "success" | "failed";

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepStatus[]>(["active", "pending", "pending", "pending"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [signature, setSignature] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoRole, setPhotoRole] = useState<"customer" | "delivery">("customer");
  const [photosDone, setPhotosDone] = useState<Set<string>>(new Set());
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [aiCompliant, setAiCompliant] = useState<boolean | null>(null);

  // Resolve params
  useState(() => {
    params.then((p) => setId(p.id));
  });

  async function startSession() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/deliveries/${id}/verify`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Échec du démarrage de la session");
      return;
    }
    setSessionId(data.sessionId);
    setActiveStep(0);
  }

  function nextStep() {
    const next = activeStep + 1;
    if (next < STEPS.length) {
      const updated = [...stepStatus];
      updated[activeStep] = "success";
      updated[next] = "active";
      setStepStatus(updated);
      setActiveStep(next);
    }
  }

  function failStep(err: string) {
    setError(err);
    const updated = [...stepStatus];
    updated[activeStep] = "failed";
    setStepStatus(updated);
  }

  // Step 1: GPS
  async function checkLocation() {
    setLoading(true);
    setError("");
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const body = {
        deliveryLat: pos.coords.latitude,
        deliveryLng: pos.coords.longitude,
        customerLat: pos.coords.latitude,
        customerLng: pos.coords.longitude,
      };
      const resp = await fetch(`/api/deliveries/${id}/verify/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        failStep(data.error ?? "GPS check failed");
      } else {
        nextStep();
      }
    } catch {
      failStep("Could not get GPS location");
    }
    setLoading(false);
  }

  // Step 2: Photos
  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setPhotoData(null);
    } catch {
      setError("Camera access denied");
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    setPhotoData(canvasRef.current.toDataURL("image/jpeg"));
    stopCamera();
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }

  async function uploadPhoto(role: "customer" | "delivery") {
    if (!photoData) return;
    setLoading(true);
    setError("");
    const blob = await (await fetch(photoData)).blob();
    const form = new FormData();
    form.append("photo", blob, `${role}.jpg`);
    form.append("role", role);
    const res = await fetch(`/api/deliveries/${id}/verify/photo`, {
      method: "POST",
      body: form,
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Photo upload failed");
      return;
    }
    const data = await res.json();
    if (data.aiWarnings?.length > 0) {
      setAiWarnings((prev) => [...prev, ...data.aiWarnings]);
      const hasPrivacyIssue = data.aiWarnings.some((w: string) => w.includes("RGPD"));
      setAiCompliant(hasPrivacyIssue ? false : true);
    } else {
      setAiCompliant(true);
    }
    setPhotosDone((prev) => new Set(prev).add(role));
    setPhotoData(null);
    if (role === "customer") {
      setPhotoRole("delivery");
    } else if (photosDone.has("customer")) {
      nextStep();
    }
  }

  // Step 3: OTP
  async function submitOTP() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/deliveries/${id}/verify/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      failStep(data.error ?? "OTP verification failed");
    } else {
      nextStep();
    }
  }

  // Step 4: Signature
  async function submitSignature() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/deliveries/${id}/verify/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Confirmation failed");
      return;
    }
    setStepStatus(["success", "success", "success", "success"]);
    setTimeout(() => router.push(`/deliveries/${id}`), 1500);
  }

  if (!id) return <p className="text-neutral-500">Chargement...</p>;

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">Vérification de livraison</h1>
        <p className="mb-6 text-sm text-neutral-600">
          Suivez les 4 étapes pour prouver la remise en main propre.
        </p>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={startSession}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Démarrage..." : "Démarrer la vérification"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Step indicators */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              stepStatus[i] === "success" ? "bg-green-500 text-white" :
              stepStatus[i] === "failed" ? "bg-red-500 text-white" :
              stepStatus[i] === "active" ? "bg-blue-600 text-white" :
              "bg-neutral-200 text-neutral-500"
            }`}>{i + 1}</div>
            <span className={`text-sm ${stepStatus[i] === "active" ? "font-medium text-neutral-900" : "text-neutral-500"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* Step 1: Location */}
      {activeStep === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Vérification de localisation</h2>
          <p className="mb-4 text-sm text-neutral-600">Nous devons vérifier que vous êtes à l'adresse de livraison.</p>
          <button onClick={checkLocation} disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >{loading ? "Vérification..." : "Vérifier ma position"}</button>
        </div>
      )}

      {/* Step 2: Photos */}
      {activeStep === 1 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            {photoRole === "customer" ? "Photo du client" : "Photo du livreur"}
          </h2>
          {aiWarnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {aiCompliant && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  ✅ Contrôle RGPD passé — Aucun visage identifiable
                </div>
              )}
              {aiWarnings.map((w, i) => (
                <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  ⚠️ {w}
                </div>
              ))}
            </div>
          )}
          {!stream ? (
            <>
              {photoData ? (
                <div className="mb-4">
                  <img src={photoData} alt="captured" className="mx-auto max-h-64 rounded" />
                  <div className="mt-3 flex justify-center gap-3">
                    <button onClick={() => { setPhotoData(null); startCamera(); }}
                      className="rounded border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100">Reprendre</button>
                    <button onClick={() => uploadPhoto(photoRole)} disabled={loading}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                      {loading ? "Envoi..." : `Envoyer photo ${photoRole === "customer" ? "client" : "livreur"}`}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={startCamera}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700">
                  Ouvrir la caméra
                </button>
              )}
            </>
          ) : (
            <div>
              <video ref={videoRef} autoPlay playsInline className="mx-auto max-h-64 rounded" />
              <button onClick={capturePhoto}
                className="mt-4 rounded-lg bg-neutral-900 px-6 py-2 text-sm text-white hover:bg-neutral-800">
                Prendre la photo
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Step 3: OTP */}
      {activeStep === 2 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Saisir le code OTP</h2>
          <p className="mb-4 text-sm text-neutral-600">Entrez le code OTP reçu sur votre appareil.</p>
          <input value={otp} onChange={(e) => setOtp(e.target.value)}
            className="mb-4 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-center text-lg tracking-widest"
            placeholder="000000" maxLength={6} />
          <button onClick={submitOTP} disabled={loading || otp.length !== 6}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Vérification..." : "Vérifier le code"}
          </button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {activeStep === 3 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Confirmer la remise</h2>
          <p className="mb-4 text-sm text-neutral-600">Tapez votre nom pour confirmer la remise en main propre.</p>
          <input value={signature} onChange={(e) => setSignature(e.target.value)}
            className="mb-4 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-center"
            placeholder="Votre nom complet" />
          <button onClick={submitSignature} disabled={loading || !signature.trim()}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
            {loading ? "Confirmation..." : "Confirmer la livraison"}
          </button>
        </div>
      )}

      {stepStatus.every((s) => s === "success") && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
          Vérification terminée ! Redirection...
        </div>
      )}
    </div>
  );
}
