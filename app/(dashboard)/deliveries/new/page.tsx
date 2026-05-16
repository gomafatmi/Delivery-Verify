"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDeliveryPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amazonOrderId: form.get("amazonOrderId"),
        customerId: form.get("customerId"),
        productDescription: form.get("productDescription"),
        productValue: Number(form.get("productValue")),
        deliveryAddress: form.get("deliveryAddress"),
        deliveryLat: form.get("deliveryLat") ? Number(form.get("deliveryLat")) : undefined,
        deliveryLng: form.get("deliveryLng") ? Number(form.get("deliveryLng")) : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Échec de la création");
    } else {
      router.push("/deliveries");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Nouvelle livraison</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-neutral-700">ID commande Amazon</label>
          <input name="amazonOrderId" required className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">ID client</label>
          <input name="customerId" required className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Description du produit</label>
          <input name="productDescription" className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Valeur du produit ($)</label>
          <input name="productValue" type="number" step="0.01" required className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Adresse de livraison</label>
          <textarea name="deliveryAddress" required className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Latitude</label>
            <input name="deliveryLat" type="number" step="any" className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Longitude</label>
            <input name="deliveryLng" type="number" step="any" className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la livraison"}
        </button>
      </form>
    </div>
  );
}
